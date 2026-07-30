import { Storage } from 'megajs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { action, email, password, data, filename } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe Mega requis' });
  }

  if (!action || !['export', 'import', 'list'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action invalide' });
  }

  try {
    const storage = await new Storage({ email, password }).ready;
    await storage.root.loadChildren();

    if (action === 'list') {
      const files = collectJsonFiles(storage.root);
      return res.json({ success: true, files });
    }

    if (action === 'export') {
      if (!data) {
        return res.status(400).json({ success: false, message: 'Données requises' });
      }

      const name = filename || 'ordonnances-archivees.json';

      let folder = storage.root.children.find(c => c.name === 'Ordonnances' && c.directory);
      if (!folder) {
        folder = await storage.mkdir({ name: 'Ordonnances' });
      }

      const existingFile = folder.children.find(c => c.name === name && !c.directory);
      if (existingFile) {
        await existingFile.delete();
      }

      const jsonStr = JSON.stringify(data, null, 2);
      await storage.upload({ name, folder }, jsonStr).complete;

      return res.json({ success: true, message: 'Exporté vers Mega.nz avec succès' });
    }

    if (action === 'import') {
      const name = filename || 'ordonnances-archivees.json';

      // Search root first
      let file = storage.root.children.find(c => c.name === name && !c.directory);

      // If not found, search in subfolders
      if (!file) {
        const folders = storage.root.children.filter(c => c.directory);
        for (const f of folders) {
          await f.loadChildren();
          file = f.children.find(c => c.name === name && !c.directory);
          if (file) break;
        }
      }

      if (!file) {
        return res.json({ success: true, data: {}, files: collectJsonFiles(storage.root) });
      }

      const buffer = await file.downloadBuffer();
      const importedData = JSON.parse(buffer.toString('utf-8'));

      return res.json({ success: true, data: importedData, filename: name });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

function collectJsonFiles(node) {
  const files = [];
  if (!node.children) return files;
  for (const child of node.children) {
    if (child.directory) continue;
    if (child.name.endsWith('.json')) {
      files.push({ name: child.name, size: child.size });
    }
  }
  return files;
}
