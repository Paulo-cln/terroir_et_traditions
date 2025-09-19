// app/api/orders/route.ts
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// 1️⃣ Credentials Google Sheets
const credentials = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
}

// 2️⃣ Authentification Google
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

// 3️⃣ Variables PayPal
const clientId = process.env.PAYPAL_CLIENT_ID!
const secret = process.env.PAYPAL_CLIENT_SECRET!
const authPaypal = Buffer.from(`${clientId}:${secret}`).toString('base64')

// 4️⃣ Fonction POST – créer commande PayPal et stocker en Google Sheets
export async function POST(req: Request) {
  try {
    const { total, email, name, address } = await req.json()

    // Création commande PayPal
    const res = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authPaypal}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: 'EUR', value: Number(total).toFixed(2) },
          },
        ],
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: 500 })
    }

    // Inscription Google Sheets (une ligne)
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID, // 👈 à mettre dans ton .env.local
      range: 'A:D', // colonnes A-D
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toISOString(), name || '', email || '', address || '', total]],
      },
    })

    return NextResponse.json({ id: data.id })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Erreur' }, { status: 500 })
  }
}
