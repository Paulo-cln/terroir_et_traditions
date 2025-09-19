// app/admin/page.tsx
export const dynamic = "force-dynamic"        // pas de pré-rendu au build
export const revalidate = 0                   // pas de cache
export const fetchCache = "force-no-store"    // pas de cache fetch

import { createClient } from '@supabase/supabase-js'

export default async function AdminPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ server-only

  // Sécurité + DX : ne crash pas si ENV manquantes
  if (!supabaseUrl || !serviceKey) {
    return (
      <div className="section" style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontFamily: 'Georgia, Garamond, serif', marginTop: 0 }}>
          Administration – configuration requise
        </h2>
        <p className="card__meta">Les variables d’environnement suivantes sont absentes :</p>
        <ul>
          {!supabaseUrl && <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>}
          {!serviceKey && <li><code>SUPABASE_SERVICE_ROLE_KEY</code> (server-only)</li>}
        </ul>
        <div className="spacer" />
        <a className="btn btn--ghost" href="/">← Retour</a>
      </div>
    )
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  // Adapte à ta table
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="section" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontFamily: 'Georgia, Garamond, serif', marginTop: 0 }}>
        Administration
      </h2>

      {error && <p style={{ color: '#B00020' }}>Erreur : {error.message}</p>}

      <div className="spacer" />
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="badge">Dernières 50 commandes</span>
        <a className="btn btn--ghost" href="/">← Retour</a>
      </div>

      <div className="spacer" />
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Email</th>
              <th>Total</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o: any) => (
              <tr key={o.id}>
                <td>{new Date(o.created_at).toLocaleString('fr-FR')}</td>
                <td>{o.email ?? '—'}</td>
                <td>{o.total ? `${Number(o.total).toFixed(2)} €` : '—'}</td>
                <td>{o.status ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="card__meta">Protège l’accès (middleware, auth, RLS côté DB).</p>
    </div>
  )
}