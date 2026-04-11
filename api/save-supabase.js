export const runtime = 'edge';

const DEFAULT_CONFIG = {
  SUPABASE_URL: 'https://nlvrgabznsmzodnylyly.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNniDbkdgTQA5uiNqmG6TnLJ3wL4',
  WRITE_PASSWORD: 'DAOUDI'
};

export async function POST(request) {
  console.log('=== SUPABASE POST: Debut ===');
  
  try {
    const { data, password, username, action, pendingKey } = await request.json();
    console.log('Data received:', Object.keys(data).length, 'ordonnances');
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
    
    // Action: Confirmer (admin confirme pending)
    if (action === 'confirm' && pendingKey) {
      if (!password || password !== writePassword) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe admin requis' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      
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
      
      return new Response(JSON.stringify({ success: response.ok, message: response.ok ? 'Confirme' : 'Erreur' }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    // Action: Refuser (admin supprime pending)
    if (action === 'reject' && pendingKey) {
      if (!password || password !== writePassword) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe admin requis' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      
      const response = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.default`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          data: {},
          status: 'confirmed',
          suggested_by: null,
          updated_at: new Date().toISOString()
        })
      });
      
      return new Response(JSON.stringify({ success: response.ok, message: response.ok ? 'Rejete' : 'Erreur' }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    // Sans mot de passe → sauvegarder comme pending
    if (!password && username) {
      console.log('Sauvegarde pending avec username:', username);
      
      // Chercher si existe déjà un pending
      const existingResponse = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.pending`, {
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
          pendingData = existing[0].data || {};
          method = 'PATCH';
          url = `${supabaseUrl}/rest/v1/ordonnances?id=eq.pending`;
        }
      }
      
      // Fusionner les données
      Object.keys(data).forEach(key => {
        pendingData[key] = data[key];
      });
      
      const finalData = {
        ...(method === 'PATCH' ? {} : { id: 'pending' }),
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
    
    // Demander pending (pour admin)
    if (pending === 'true') {
      console.log('Chargement pending...');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/ordonnances?id=eq.pending`, {
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
        return new Response(JSON.stringify({ 
          success: true, 
          data: result.length > 0 ? result[0].data : {},
          suggested_by: result.length > 0 ? result[0].suggested_by : null
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
      
      let data = {};
      if (result.length > 0 && result[0].data) {
        // Filtrer pending (ceux avec suffixe "(par...)")
        const rawData = result[0].data;
        Object.keys(rawData).forEach(key => {
          if (!key.includes(' (par ')) {
            data[key] = rawData[key];
          }
        });
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