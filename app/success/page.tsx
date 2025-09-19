"use client"

import { useSearchParams } from "next/navigation"

export default function SuccessPage() {
  const params = useSearchParams()

  const total = params.get("total") || "—"
  const email = params.get("email") || "—"
  const name = params.get("name") || ""
  const a = params.get("a") || ""
  const pc = params.get("pc") || ""
  const city = params.get("city") || ""
  const address = [a, [pc, city].filter(Boolean).join(" ")].filter(Boolean).join(" · ")

  const hasData = total !== "—" || email !== "—"

  return (
    <div className="section" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontFamily: 'Georgia, Garamond, serif', marginTop: 0, color: "#4A1C27" }}>
        Merci pour ta commande 🎉
      </h2>

      {hasData ? (
        <>
          <p className="card__meta">
            Un email de confirmation a été envoyé à <strong>{email}</strong>.
          </p>

          <div className="spacer" />

          <div className="card">
            <div className="card__body">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>Reçu PayPal</strong>
                <span className="badge">Paiement reçu</span>
              </div>

              <div className="spacer" />

              <div className="row" style={{ gap: 24 }}>
                <div>
                  <div className="card__meta">Montant</div>
                  <div><strong>{total} €</strong></div>
                </div>
                <div>
                  <div className="card__meta">Client</div>
                  <div>{name || "—"}</div>
                </div>
                <div>
                  <div className="card__meta">Livraison</div>
                  <div>{address || "Adresse communiquée ultérieurement"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="spacer" />
          <a className="btn btn--ghost" href="/">← Retour à la boutique</a>
        </>
      ) : (
        <>
          <p className="card__meta">
            Paiement confirmé. Si des informations n’apparaissent pas, c’est que PayPal ne les a pas renvoyées.
          </p>
          <div className="spacer" />
          <a className="btn btn--ghost" href="/">← Retour à la boutique</a>
        </>
      )}
    </div>
  )
}