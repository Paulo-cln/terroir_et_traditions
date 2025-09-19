import './globals.css'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Theirroir & Traditions — Boutique',
  description: 'Paniers & spécialités du terroir. Paiement PayPal.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head />
      <body>
        <div className="container">
          <header className="header header--sticky" role="banner">
            {/* Topbar info */}
            <div className="topbar" role="note" aria-label="Informations de livraison">
              
            </div>

            {/* Barre principale */}
            <div className="header__bar">
              {/* Marque */}
              <Link href="/" className="brand" aria-label="Accueil Theirroir & Traditions">
                <span className="brand__logo brand__logo--round">
                  <Image
                    src="/logotheirroir.png"
                    alt="Theirroir & Traditions"
                    width={40}
                    height={40}
                    priority
                    className="brand__logo-img"
                  />
                </span>
                <div className="brand__text">
                  <span className="brand__title">Theirroir & Traditions</span>
                  <span className="brand__subtitle">Goûtez à nos saveurs 100% artisanales</span>
                </div>
              </Link>

              {/* Navigation principale */}
              <nav className="nav nav--primary" aria-label="Navigation principale">
                <Link href="/">Accueil</Link>
                <Link href="/checkout">Commander</Link>
              </nav>

              {/* Actions (recherche + contact + CTA) */}
              <div className="header__actions">
                <form className="search" role="search" action="/" method="GET">
                  <input name="q" placeholder="Rechercher…" aria-label="Rechercher des produits" />
                  <button className="search__btn" type="submit" aria-label="Lancer la recherche">🔎</button>
                </form>

                <a className="link-ghost" href="mailto:theirroirtraditions@gmail.com">Contact</a>
                <Link className="btn btn--cta" href="/checkout">🧺 Commander</Link>
              </div>
            </div>

            {/* Liseré distinctif */}
            <div className="header__stripe" aria-hidden="true" />
          </header>

          <main>{children}</main>

          <footer className="footer">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>© {new Date().getFullYear()} Theirroir & Traditions</div>
              <div>
                Contact :{' '}
                <a href="mailto:theirroirtraditions@gmail.com">theirroirtraditions@gmail.com</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}