export const runtime = 'edge';

const DEFAULT_CONFIG = {
  SUPABASE_URL: 'https://nlvrgabznsmzodnylyly.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNniDbkdgTQA5uiNqmG6TnLJ3wL4',
  WRITE_PASSWORD: 'DAOUDI'
};

export async function POST(request) {
  console.log('=== COMMENTAIRES POST: Debut ===');
  
  try {
    const body = await request.json();
    const { nom, situation, message, action, password, commentId, nouveauMessage } = body;
    
    const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_CONFIG.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || DEFAULT_CONFIG.SUPABASE_KEY;
    const writePassword = process.env.WRITE_PASSWORD || DEFAULT_CONFIG.WRITE_PASSWORD;
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ success: false, message: 'Supabase config not set' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Ajouter un nouveau commentaire (sans mot de passe = pending)
    if (action === 'add' && nom && message) {
      const commentId = `commentaire_${nom.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
      
      const response = await fetch(`${supabaseUrl}/rest/v1/commentaires`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id: commentId,
          nom: nom,
          situation: situation || 'Autre',
          message: message,
          status: 'pending',
          created_at: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'pending',
          info: 'Votre proposition sera examinée par l\'admin'
        }), { headers: { 'Content-Type': 'application/json' } });
      }
      
      const error = await response.text();
      return new Response(JSON.stringify({ success: false, message: error }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Confirmer un commentaire (admin)
    if (action === 'confirm' && commentId) {
      if (!password || password !== writePassword) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe admin requis' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      
      const response = await fetch(`${supabaseUrl}/rest/v1/commentaires?id=eq.${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ status: 'confirmed' })
      });
      
      return new Response(JSON.stringify({ success: response.ok, message: response.ok ? 'Confirme' : 'Erreur' }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    // Rejeter un commentaire (admin)
    if (action === 'reject' && commentId) {
      if (!password || password !== writePassword) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe admin requis' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      
      const response = await fetch(`${supabaseUrl}/rest/v1/commentaires?id=eq.${commentId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      return new Response(JSON.stringify({ success: response.ok, message: response.ok ? 'Rejete' : 'Erreur' }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    // Modifier un commentaire (admin)
    if (action === 'modify' && commentId && nouveauMessage) {
      if (!password || password !== writePassword) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe admin requis' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      
      const response = await fetch(`${supabaseUrl}/rest/v1/commentaires?id=eq.${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ message: nouveauMessage })
      });
      
      return new Response(JSON.stringify({ success: response.ok, message: response.ok ? 'Modifie' : 'Erreur' }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ success: false, message: 'Action non reconnue' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    
  } catch (error) {
    console.log('=== COMMENTAIRES POST: Erreur ===', error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function GET(request) {
  console.log('=== COMMENTAIRES GET: Debut ===');
  
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
      const response = await fetch(`${supabaseUrl}/rest/v1/commentaires?status=eq.pending&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        return new Response(JSON.stringify({ success: true, pending: result }), { headers: { 'Content-Type': 'application/json' } });
      }
      
      return new Response(JSON.stringify({ success: false, message: 'Erreur' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Chargement normal (confirmed seulement)
    const response = await fetch(`${supabaseUrl}/rest/v1/commentaires?status=eq.confirmed&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('=== COMMENTAIRES GET: Succes ===', result.length, 'commentaires');
      return new Response(JSON.stringify({ success: true, commentaires: result }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    const error = await response.text();
    return new Response(JSON.stringify({ success: false, message: error }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    
  } catch (error) {
    console.log('=== COMMENTAIRES GET: Erreur ===', error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}