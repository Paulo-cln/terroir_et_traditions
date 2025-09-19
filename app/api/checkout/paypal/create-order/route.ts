import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { total } = await req.json()

    if (!total || isNaN(Number(total))) {
      return NextResponse.json({ error: 'Total invalide' }, { status: 400 })
    }

    const clientId = process.env.PAYPAL_CLIENT_ID!
    const secret = process.env.PAYPAL_CLIENT_SECRET!
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')

    const res = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: 'EUR', value: Number(total).toFixed(2) }
          }
        ],
        application_context: {
          shipping_preference: 'GET_FROM_FILE' // récupère l’adresse PayPal
        }
      })
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data }, { status: 500 })
    return NextResponse.json({ id: data.id })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'error' }, { status: 500 })
  }
}
