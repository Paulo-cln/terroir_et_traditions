'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

// Import PayPal côté client uniquement
const PaypalButton = dynamic(() => import('./component/PaypalButton'), { ssr: false })
const CART_BG = '/logotheirroir.png'

/** Produit du catalogue (prix en centimes) */
type Item = {
  id: string
  name: string
  price: number // en centimes
  description: string
  image?: string
  tag?: string
  origin?: string
}

/** Ligne du panier (prix en centimes) */
type CartLine = { id: string; name: string; price: number; quantity: number }

/** Catalogue démo (remplace ou branche tes données réelles) */
const PRODUCTS: Item[] = [
  {
    id: 'disc',
    name: 'Panier découverte',
    price: 2990,
    description: '6 produits · idéal cadeau',
    tag: 'Nouveau',
    image:
      'panier.jpg',
  },
  {
    id: 'gourm',
    name: 'Panier gourmand',
    price: 4990,
    description: '8 produits · best-seller',
    tag: 'Best-seller',
    image:
      'panier1.jpg',
  },
  {
    id: 'prest',
    name: 'Panier prestige',
    price: 7990,
    description: '12 produits · éditions locales',
    image:
      'panier2.jpg',
    origin: 'Sélection locale',
  },
  {
    id: 'jam',
    name: 'Coffret confitures',
    price: 1990,
    description: 'assortiment saisonnier',
    image:
      'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?q=80&w=1200&auto=format&fit=crop',
  },
]

export default function Page() {
  const [cart, setCart] = useState<CartLine[]>([])
  const total = cart.reduce((sum, l) => sum + l.price * l.quantity, 0) // en centimes

  function addToCart(p: Item) {
    setCart((c) => {
      const idx = c.findIndex((l) => l.id === p.id)
      if (idx >= 0) {
        const copy = [...c]
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 }
        return copy
      }
      return [...c, { id: p.id, name: p.name, price: p.price, quantity: 1 }]
    })
  }

  function inc(id: string, delta: number) {
    setCart((c) =>
      c
        .map((l) => (l.id === id ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    )
  }

  async function checkout() {
    if (cart.length === 0) return
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart }),
    })
    if (!res.ok) {
      alert('Erreur de création de paiement')
      return
    }
    const { url } = (await res.json()) as { url: string }
    window.location.href = url
  }

  return (
    <div className="row" style={{ alignItems: 'flex-start', gap: 24 }}>
      {/* Produits */}
      <div style={{ flex: 1 }}>
        <h2>Boutique</h2>
        <div className="grid">
          {PRODUCTS.map((p) => (
            <article className="product-card" key={p.id}>
              <div className="product-media">
                {p.image ? (
                  <img src={p.image} alt={p.name} loading="lazy" />
                ) : (
                  <div className="product-fallback">
                    {p.name
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                )}
                {p.tag && <span className="ribbon">{p.tag}</span>}
                <div className="vine-gradient" aria-hidden />
              </div>

              <div className="product-body">
                <h3 className="product-title">{p.name}</h3>
                <p className="product-meta">
                  {p.description}
                  {p.origin ? (
                    <>
                      {' '}
                      · <span className="chip chip-olive">{p.origin}</span>
                    </>
                  ) : null}
                </p>

                <div className="product-actions row" style={{ justifyContent: 'space-between' }}>
                  <div className="price-tag">
                    <span className="price">{(p.price / 100).toFixed(2)} €</span>
                    <span className="ttc">TTC</span>
                  </div>
                  <button
                    className="btn"
                    onClick={() => addToCart(p)}
                    aria-label={`Ajouter ${p.name} au panier`}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>



      <div style={{ width: 380, maxWidth: '100%' }}>
        <div
  className="cart-card"
  style={{
    backgroundImage: `linear-gradient(180deg, rgba(255,255,255,.70), rgba(255,255,255,.85)), url(${CART_BG})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>

          <div className="cart-header row" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>Panier</h2>
            <span className="pill-count">
              {cart.reduce((n, l) => n + l.quantity, 0)}
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty">🧺 Ton panier est vide</div>
          ) : (
            <>
              <div className="cart-lines">
                {cart.map((line) => (
                  <div className="cart-line" key={line.id}>
                    <div>
                      <div className="cart-line__title">{line.name}</div>
                      <div className="cart-line__meta">
                        {(line.price / 100).toFixed(2)} € / unité
                      </div>
                    </div>

                    <div className="cart-line__qty">
                      <button
                        className="btn-qty"
                        aria-label={`Diminuer ${line.name}`}
                        onClick={() => inc(line.id, -1)}
                      >
                        −
                      </button>
                      <span style={{ minWidth: 18, textAlign: 'center' }}>{line.quantity}</span>
                      <button
                        className="btn-qty"
                        aria-label={`Augmenter ${line.name}`}
                        onClick={() => inc(line.id, +1)}
                      >
                        +
                      </button>
                      <button
                        className="btn-remove"
                        onClick={() => inc(line.id, -line.quantity)}
                        aria-label={`Supprimer ${line.name}`}
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="cart-line__total">
                      {((line.price * line.quantity) / 100).toFixed(2)} €
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <div className="cart-summary">
                  <span className="total-chip">
                    <span className="label">Total TTC</span>
                    <span className="value">{(total / 100).toFixed(2)} €</span>
                  </span>
                </div>

                <div className="cart-actions">
                  {/* PayPal (clé basée sur le total pour éviter les doublons) */}
                  <PaypalButton
                    key={Math.round(total)}
                    total={total / 100}
                    onSuccess={(details: any) => {
                      console.log('PayPal success', details)
                      window.location.href = '/success'
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}