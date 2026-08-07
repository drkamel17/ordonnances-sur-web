import { Storage } from 'megajs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { provider, action, email, password, data, filename, server } = req.body;

  if (!action || !['export', 'import', 'list'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action invalide' });
  }

  try {
    if (provider === 'seafile') {
      return await handleSeafile(res, { action, email, password, data, filename, server });
    }
    return await handleMega(res, { action, email, password, data, filename });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ===================== Mega.nz =====================

async function handleMega(res, { action, email, password, data, filename }) {
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe Mega requis' });
  }

  const storage = await new Storage({ email, password }).ready;

  if (action === 'list') {
    const files = storage.root.children
      .filter(c => !c.directory && c.name.endsWith('.json'))
      .map(c => ({ name: c.name, size: c.size }));
    return res.json({ success: true, files });
  }

  if (action === 'export') {
    if (!data) {
      return res.status(400).json({ success: false, message: 'Données requises' });
    }

    const name = filename || 'ordonnances-archivees.json';
    const existing = storage.root.children.find(c => c.name === name && !c.directory);
    if (existing) await existing.delete();

    const jsonStr = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonStr, 'utf-8');
    await storage.upload(name, buffer).complete;

    return res.json({ success: true, message: 'Exporté vers Mega.nz avec succès' });
  }

  if (action === 'import') {
    const name = filename || 'ordonnances-archivees.json';
    const file = storage.root.children.find(c => c.name === name && !c.directory);

    if (!file) {
      return res.json({ success: true, data: {}, notFound: true });
    }

    const buffer = await file.downloadBuffer();
    const importedData = JSON.parse(buffer.toString('utf-8'));

    return res.json({ success: true, data: importedData, filename: name });
  }
}

// ===================== Seafile =====================

async function seafileGetToken(server, email, password) {
  const response = await fetch(`${server}/api2/auth-token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password }).toString()
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error('Authentification Seafile échouée: ' + errText.slice(0, 200));
  }

  const data = await response.json();
  if (!data.token) {
    throw new Error('Authentification Seafile échouée: token manquant');
  }
  return data.token;
}

async function seafileGetDefaultRepo(server, token) {
  const response = await fetch(`${server}/api2/repos/`, {
    headers: { 'Authorization': `Token ${token}` }
  });

  if (!response.ok) {
    throw new Error('Erreur liste des bibliothèques Seafile');
  }

  const repos = await response.json();
  const defaultRepo = repos.find(r => r.type === 'mine' && r.name === 'My Library')
    || repos.find(r => r.type === 'mine')
    || repos[0];

  if (!defaultRepo) {
    throw new Error('Aucune bibliothèque trouvée sur Seafile');
  }

  return defaultRepo;
}

async function handleSeafile(res, { action, email, password, data, filename, server }) {
  if (!server || !email || !password) {
    return res.status(400).json({ success: false, message: 'Serveur, email et mot de passe Seafile requis' });
  }

  server = server.replace(/\/+$/, '');

  const token = await seafileGetToken(server, email, password);
  const authHeaders = { 'Authorization': `Token ${token}` };
  const defaultRepo = await seafileGetDefaultRepo(server, token);
  const repoId = defaultRepo.id;

  if (action === 'list') {
    const dirRes = await fetch(`${server}/api2/repos/${repoId}/dir/?p=/`, { headers: authHeaders });
    if (!dirRes.ok) {
      throw new Error('Erreur lecture du dossier Seafile');
    }
    const entries = await dirRes.json();
    const files = entries
      .filter(e => e.type === 'file' && e.name.endsWith('.json'))
      .map(e => ({ name: e.name, size: e.size }));
    return res.json({ success: true, files });
  }

  if (action === 'export') {
    if (!data) {
      return res.status(400).json({ success: false, message: 'Données requises' });
    }

    const name = filename || 'ordonnances-archivees.json';

    // Delete existing file if present
    await fetch(`${server}/api2/repos/${repoId}/file/?p=/${name}`, {
      method: 'DELETE',
      headers: authHeaders
    });

    const uploadLinkRes = await fetch(`${server}/api2/repos/${repoId}/upload-link/?p=/`, {
      method: 'GET',
      headers: authHeaders
    });
    if (!uploadLinkRes.ok) {
      const errText = await uploadLinkRes.text();
      throw new Error(`Erreur obtention du lien d'upload Seafile (${uploadLinkRes.status}): ${errText.slice(0, 200)}`);
    }
    const uploadUrl = (await uploadLinkRes.json()).trim();

    const jsonStr = JSON.stringify(data, null, 2);
    const formData = new FormData();
    formData.append('parent_dir', '/');
    formData.append('file', new Blob([jsonStr], { type: 'application/json' }), name);

    const upRes = await fetch(uploadUrl, { method: 'POST', body: formData });

    if (!upRes.ok) {
      const upErr = await upRes.text();
      throw new Error(`Échec upload Seafile (${upRes.status}): ${upErr.slice(0, 200)}`);
    }

    return res.json({ success: true, message: 'Exporté vers Seafile avec succès' });
  }

  if (action === 'import') {
    const name = filename || 'ordonnances-archivees.json';
    const fileRes = await fetch(`${server}/api2/repos/${repoId}/file/?p=/${name}`, { headers: authHeaders });

    if (!fileRes.ok) {
      return res.json({ success: true, data: {}, notFound: true });
    }

    let fileText = await fileRes.text();

    // L'API Seafile renvoie un LIEN de téléchargement (chaîne JSON), pas le contenu.
    if (fileText.trim().startsWith('"')) {
      const link = JSON.parse(fileText);
      if (typeof link === 'string' && link.startsWith('http')) {
        const dlRes = await fetch(link);
        if (!dlRes.ok) {
          throw new Error('Erreur téléchargement du fichier Seafile: ' + dlRes.status);
        }
        fileText = await dlRes.text();
      }
    }

    const importedData = JSON.parse(fileText);

    if (!importedData || typeof importedData !== 'object' || Array.isArray(importedData)) {
      throw new Error('Le fichier importé n\'est pas au bon format');
    }

    return res.json({ success: true, data: importedData, filename: name });
  }
}
