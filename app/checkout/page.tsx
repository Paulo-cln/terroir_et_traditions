import PaypalButton from "../component/PaypalButton"

export default function CheckoutPage() {
  return (
    <div className="section" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontFamily: 'Georgia, Garamond, serif', marginTop: 0 }}>Finaliser la commande</h2>
      <p className="card__meta">
        Montant par défaut pour la démo. Ajuste le prix dans le composant si besoin.
      </p>

      <div className="spacer" />
      <div className="row">
        <a className="btn btn--ghost" href="/">← Continuer à parcourir</a>
      </div>

      <div className="spacer" />
      <PaypalButton total={49.99} />
    </div>
  )
}