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
      await storage.upload(name, jsonStr).complete;

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
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
