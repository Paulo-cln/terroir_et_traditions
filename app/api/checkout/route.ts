import { readFileSync } from 'fs'
import { google } from 'googleapis'

const credentials = JSON.parse(
  readFileSync(process.cwd() + '/service-account.json', 'utf-8')
)

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { total } = await req.json() // attendu en euros (ex: 12.50)
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
        purchase_units: [{
          amount: { currency_code: 'EUR', value: Number(total).toFixed(2) }
        }]
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
