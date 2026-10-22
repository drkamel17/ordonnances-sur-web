export const runtime = 'edge';

const DEFAULT_CONFIG = {
  SUPABASE_URL: 'https://nlvrgabznsmzodnylyly.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNniDbkdgTQA5uiNqmG6TnLJ3wL4',
  WRITE_PASSWORD: 'DAOUDI'
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { nom, etablissement, message, action, password, avisId, reponse } = body;

    const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_CONFIG.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || DEFAULT_CONFIG.SUPABASE_KEY;
    const writePassword = process.env.WRITE_PASSWORD || DEFAULT_CONFIG.WRITE_PASSWORD;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ success: false, message: 'Supabase config not set' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Ajouter un nouvel avis (sans mot de passe = pending)
    if (action === 'add' && nom && message) {
      const avisId = `avis_${nom.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

      const response = await fetch(`${supabaseUrl}/rest/v1/avis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id: avisId,
          nom: nom,
          etablissement: etablissement || '',
          message: message,
          status: 'pending',
          created_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        return new Response(JSON.stringify({ success: true, message: 'pending' }), { headers: { 'Content-Type': 'application/json' } });
      }

      const error = await response.text();
      return new Response(JSON.stringify({ success: false, message: error }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Confirmer un avis (admin)
    if (action === 'confirm' && avisId) {
      if (!password || password !== writePassword) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe admin requis' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/avis?id=eq.${avisId}`, {
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

    // Rejeter un avis (admin)
    if (action === 'reject' && avisId) {
      if (!password || password !== writePassword) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe admin requis' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/avis?id=eq.${avisId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      return new Response(JSON.stringify({ success: response.ok, message: response.ok ? 'Rejete' : 'Erreur' }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Répondre à un avis (admin)
    if (action === 'reply' && avisId && body.reponse) {
      if (!password || password !== writePassword) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe admin requis' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/avis?id=eq.${avisId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ reponse_admin: body.reponse })
      });

      return new Response(JSON.stringify({ success: response.ok, message: response.ok ? 'Reponse ajoutee' : 'Erreur' }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Supprimer définitivement un avis (admin)
    if (action === 'delete' && avisId) {
      if (!password || password !== writePassword) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe admin requis' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/avis?id=eq.${avisId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      return new Response(JSON.stringify({ success: response.ok, message: response.ok ? 'Supprime' : 'Erreur' }), { headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function GET(request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_CONFIG.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || DEFAULT_CONFIG.SUPABASE_KEY;
    const writePassword = process.env.WRITE_PASSWORD || DEFAULT_CONFIG.WRITE_PASSWORD;
    const urlParams = new URL(request.url).searchParams;
    const pending = urlParams.get('pending');
    const verify = urlParams.get('verify');
    const pass = urlParams.get('pass');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ success: false, message: 'Supabase config not set' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (verify === 'true' && pass) {
      const isValid = (pass === writePassword);
      return new Response(JSON.stringify({ valid: isValid }), {
        status: isValid ? 200 : 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pending === 'true') {
      const response = await fetch(`${supabaseUrl}/rest/v1/avis?status=eq.pending&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return new Response(JSON.stringify({ success: true, avis: result }), { headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: false, message: 'Erreur' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/avis?status=eq.confirmed&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      return new Response(JSON.stringify({ success: true, avis: result }), { headers: { 'Content-Type': 'application/json' } });
    }

    const error = await response.text();
    return new Response(JSON.stringify({ success: false, message: error }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}