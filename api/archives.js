import { Storage } from 'megajs';

const FOLDER_NAME = 'Ordonnances';
const FILE_NAME = 'ordonnances-archivees.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, data } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe Mega requis' });
  }

  if (!action || !['export', 'import'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action invalide' });
  }

  try {
    const storage = await new Storage({ email, password }).ready;

    if (action === 'export') {
      if (!data) {
        return res.status(400).json({ success: false, message: 'Données requises' });
      }

      let folder = storage.root.children.find(c => c.name === FOLDER_NAME && c.directory);
      if (!folder) {
        folder = await storage.mkdir({ name: FOLDER_NAME });
      }

      const existingFile = folder.children.find(c => c.name === FILE_NAME && !c.directory);
      if (existingFile) {
        await existingFile.delete();
      }

      const jsonStr = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonStr, 'utf-8');
      await storage.upload({ name: FILE_NAME, folder }, buffer).complete;

      return res.json({ success: true, message: 'Exporté vers Mega.nz avec succès' });
    }

    if (action === 'import') {
      const folder = storage.root.children.find(c => c.name === FOLDER_NAME && c.directory);
      if (!folder) {
        return res.json({ success: true, data: {} });
      }

      const file = folder.children.find(c => c.name === FILE_NAME && !c.directory);
      if (!file) {
        return res.json({ success: true, data: {} });
      }

      const buffer = await file.downloadBuffer();
      const importedData = JSON.parse(buffer.toString('utf-8'));

      return res.json({ success: true, data: importedData });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
