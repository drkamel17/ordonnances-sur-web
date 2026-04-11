export const runtime = 'edge';

const DEFAULT_CONFIG = {
  SUPABASE_URL: 'https://nlvrgabznsmzodnylyly.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNniDbkdgTQA5uiNqmG6TnLJ3wL4',
  WRITE_PASSWORD: 'DAOUDI'
};

export async function POST(request) {
  console.log('=== SUPABASE POST: Debut ===');
  
  try {
    const body = await request.json();
    const { data, password, username, action, pendingKey, pendingId, titre, nouveauxMedicaments } = body;
    console.log('Data received:', data ? Object.keys(data).length : 0, 'ordonnances');
    console.log('Password received:', password ? 'Yes' : 'No');
    console.log('Username received:', username ? 'Yes' : 'No');
    console.log('Action:', action || 'save');
    
    const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_CONFIG.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || DEFAULT_CONFIG.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Supabase config not set' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const writePassword = process.env.WRITE_PASSWORD || DEFAULT_CONFIG.WRITE_PASSWORD;
    
    // Action: Confirmer (admin confirme pending et ajoute aux données principales)
    if (action === 'confirm' && pendingKey) {
      if (!password || password !== writePassword) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe admin requis' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      
      // Le pendingKey contient l'ID complet comme "pending_ahmed"
      const pendingId = pendingKey;
      
      // Récupérer les données pending pour cet utilisateur
      const pendingResponse = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.${pendingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (!pendingResponse.ok) {
        return new Response(JSON.stringify({ success: false, message: 'Pending non trouvé' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      
      const pendingDataResult = await pendingResponse.json();
      if (pendingDataResult.length === 0) {
        return new Response(JSON.stringify({ success: false, message: 'Aucune donnée pending' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      
      const pendingData = pendingDataResult[0].data || {};
      
      // Récupérer les données default existantes
      const defaultResponse = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.default`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      let defaultData = {};
      if (defaultResponse.ok) {
        const defaultResult = await defaultResponse.json();
        if (defaultResult.length > 0) {
          defaultData = defaultResult[0].data || {};
        }
      }
      
      // Fusionner: ajouter les nouvelles ordonnances aux existantes
      Object.keys(pendingData).forEach(key => {
        defaultData[key] = pendingData[key];
      });
      
      // Mettre à jour default avec les données fusionnées
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.default`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          data: defaultData,
          status: 'confirmed',
          suggested_by: null,
          updated_at: new Date().toISOString()
        })
      });
      
      // Supprimer le pending de cet utilisateur
      await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.${pendingId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      return new Response(JSON.stringify({ success: updateResponse.ok, message: updateResponse.ok ? 'Confirme' : 'Erreur' }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    // Action: Refuser (admin supprime pending)
    if (action === 'reject' && pendingKey) {
      if (!password || password !== writePassword) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe admin requis' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      
      // Supprimer la ligne pending pour cet utilisateur
      const response = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.${pendingKey}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      return new Response(JSON.stringify({ success: response.ok, message: response.ok ? 'Rejete' : 'Erreur' }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    // Action: Modifier (admin modifie les medicaments d'un pending)
    if (action === 'modify' && pendingId && titre && nouveauxMedicaments) {
      if (!password || password !== writePassword) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe admin requis' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      
      // Récupérer le pending actuel
      const pendingResponse = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.${pendingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (!pendingResponse.ok) {
        return new Response(JSON.stringify({ success: false, message: 'Pending non trouvé' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      
      const pendingResult = await pendingResponse.json();
      if (pendingResult.length === 0) {
        return new Response(JSON.stringify({ success: false, message: 'Aucune donnée pending' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      
      // Modifier les médicaments
      const pendingData = pendingResult[0].data || {};
      if (pendingData && pendingData[titre]) {
        pendingData[titre] = nouveauxMedicaments;
      } else {
        return new Response(JSON.stringify({ success: false, message: 'Titre non trouvé' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      
      // Sauvegarder
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.${pendingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          data: pendingData,
          updated_at: new Date().toISOString()
        })
      });
      
      return new Response(JSON.stringify({ success: updateResponse.ok, message: updateResponse.ok ? 'Modifie' : 'Erreur' }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    // Sans mot de passe → sauvegarder comme pending (nouvelle ordonnance uniquement)
    if (!password && username) {
      console.log('Sauvegarde pending avec username:', username);
      console.log('Data a sauvegarder:', Object.keys(data).length, 'ordonnances');
      
      // Créer un ID unique pour cet utilisateur
      const pendingId = `pending_${username.toLowerCase().replace(/\s+/g, '_')}`;
      
      // Chercher si cet utilisateur a déjà un pending
      const existingResponse = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.${pendingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      let pendingData = {};
      let method = 'POST';
      let url = `${supabaseUrl}/rest/v1/ordonnances`;
      
      if (existingResponse.ok) {
        const existing = await existingResponse.json();
        if (existing.length > 0) {
          // Utilisateur a déjà un pending, on récupère ses données
          pendingData = existing[0].data || {};
          method = 'PATCH';
          url = `${supabaseUrl}/rest/v1/ordonnances?id=eq.${pendingId}`;
          console.log('Pending existant trouvé, données:', Object.keys(pendingData).length);
        }
      }
      
      // Récupérer les données default pour éviter les doublons
      const defaultResponse = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.default`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      let defaultData = {};
      if (defaultResponse.ok) {
        const defaultResult = await defaultResponse.json();
        if (defaultResult.length > 0) {
          defaultData = defaultResult[0].data || {};
        }
      }
      
      // Ajouter seulement les nouvelles ordonnances (pas celles qui sont déjà dans default)
      Object.keys(data).forEach(key => {
        // Ajouter le nom d'utilisateur au titre
        const newKey = `${key} (par ${username})`;
        // Ne pas ajouter si cette clé existe déjà dans default
        if (!defaultData[key]) {
          pendingData[newKey] = data[key];
        }
      });
      
      console.log('Pending final:', Object.keys(pendingData).length, 'ordonnances');
      
      const finalData = {
        ...(method === 'PATCH' ? {} : { id: pendingId }),
        data: pendingData,
        status: 'pending',
        suggested_by: username,
        updated_at: new Date().toISOString()
      };
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(finalData)
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        console.log('=== SUPABASE POST: Pending saved ===');
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'pending',
          info: 'Votre enregistrement sera pris en consideration apres la confirmation de l\'admin'
        }), { headers: { 'Content-Type': 'application/json' } });
      }
      
      const error = await response.text();
      console.log('Erreur:', error);
      return new Response(JSON.stringify({ success: false, message: error }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Avec mot de passe → sauvegarder directement (confirmed)
    if (password === writePassword) {
      console.log('Sauvegarde confirmed avec mot de passe');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.default`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          data: data,
          status: 'confirmed',
          suggested_by: null,
          updated_at: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        return new Response(JSON.stringify({ success: true, message: 'Data saved to Supabase' }), { headers: { 'Content-Type': 'application/json' } });
      }
      
      const error = await response.text();
      return new Response(JSON.stringify({ success: false, message: error }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Mot de passe incorrect ou nom d\'utilisateur requis',
      requiresPassword: true
    }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    
  } catch (error) {
    console.log('=== SUPABASE POST: Erreur ===', error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function GET(request) {
  console.log('=== SUPABASE GET: Debut ===');
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_CONFIG.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || DEFAULT_CONFIG.SUPABASE_KEY;
    const urlParams = new URL(request.url).searchParams;
    const pending = urlParams.get('pending');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ success: false, message: 'Supabase config not set' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Demander pending (pour admin) - récupérer toutes les lignes avec status=pending
    if (pending === 'true') {
      console.log('Chargement pending...');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/ordonnances?status=eq.pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Pending ordonnances:', result.length);
        
        // Renvoyer chaque utilisateur avec ses données
        const usersWithData = result.map(row => ({
          id: row.id,
          suggested_by: row.suggested_by,
          data: row.data || {}
        }));
        
        return new Response(JSON.stringify({ 
          success: true, 
          users: usersWithData
        }), { headers: { 'Content-Type': 'application/json' } });
      }
      
      return new Response(JSON.stringify({ success: false, message: 'Erreur' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Chargement normal (confirmed seulement)
    console.log('Tentative de chargement depuis Supabase...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.default`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Donnees recues:', result.length, 'lignes');
      console.log('=== SUPABASE GET: Succes ===');
      
      // Les données de `id=default` sont déjà les données confirmées
      let data = {};
      if (result.length > 0 && result[0].data) {
        data = result[0].data;
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        data: data
      }), { headers: { 'Content-Type': 'application/json' } });
    } else {
      const error = await response.text();
      return new Response(JSON.stringify({ success: false, message: error }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }
    
  } catch (error) {
    console.log('=== SUPABASE GET: Erreur ===', error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}