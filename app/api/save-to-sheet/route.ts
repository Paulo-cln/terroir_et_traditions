// app/api/save-to-sheet/route.ts
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs' // requis pour utiliser 'googleapis' (pas compatible edge)

function requiredEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

export async function POST(req: Request) {
  try {
    // 1) Récupération et validation du payload
    const body = await req.json().catch(() => ({} as any))
    const { name, email, address, total, orderId } = body || {}

    if (!name || !email || typeof total === 'undefined') {
      return NextResponse.json(
        { error: 'Payload invalide : name, email, total sont requis' },
        { status: 400 }
      )
    }

    // 2) Lecture et normalisation des variables d’environnement
    //    (utilise les noms déjà présents dans ton .env)
    const clientEmail = requiredEnv('GOOGLE_CLIENT_EMAIL')
    const privateKey = requiredEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n')
    const spreadsheetId = requiredEnv('GOOGLE_SHEET_ID')

    // 3) Auth Google (Service Account)
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    // 4) Client Sheets et append d’une ligne
    const sheets = google.sheets({ version: 'v4', auth })

    // 6 valeurs -> colonne A à F (A:F)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:F',
      valueInputOption: 'USER_ENTERED', // ou 'RAW' si tu ne veux aucune interprétation
      requestBody: {
        values: [[
          new Date().toISOString(),
          String(name ?? ''),
          String(email ?? ''),
          String(address ?? ''),
          String(total ?? ''),
          String(orderId ?? ''),
        ]],
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    // Log serveur (apparaît dans la console de l’hébergeur)
    console.error('[save-to-sheet]', err)
    return NextResponse.json(
      { error: err?.message ?? 'Internal error' },
      { status: 500 }
    )
  }
}
