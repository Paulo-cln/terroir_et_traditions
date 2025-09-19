// app/api/paypal/capture-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  const { orderID } = await req.json();

  // --- 1. Capture l’ordre PayPal ---
  const res = await fetch(
    `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET
        ).toString("base64")}`,
      },
    }
  );

  const data = await res.json();
  const shipping = data?.purchase_units?.[0]?.shipping?.address;
  const name = data?.purchase_units?.[0]?.shipping?.name?.full_name ?? "";

  // --- 2. Push vers Google Sheets ---
  try {
    // Charge la clé JSON stockée dans un fichier ou variable d’env
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY_JSON || "{}");

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.SPREADSHEET_ID; // ton ID Google Sheet

    // Prépare la ligne à insérer
    const values = [
      [
        new Date().toLocaleString(),
        name,
        shipping?.address_line_1,
        shipping?.admin_area_2, // ville
        shipping?.postal_code,
        shipping?.country_code,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Feuille1!A:F", // adapte au nom de ta feuille et tes colonnes
      valueInputOption: "RAW",
      requestBody: { values },
    });
  } catch (err) {
    console.error("Erreur Google Sheets:", err);
  }

  return NextResponse.json({ success: true, shipping });
}