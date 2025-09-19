// app/component/init_fastlane.ts
export function initFastlane(): void {
  if (typeof window === 'undefined') return

  const paypal = (window as any).paypal
  if (!paypal || typeof paypal.Fastlane !== 'function') {
    console.warn('[PayPal Fastlane] non chargé (components=fastlane ?)')
    return
  }

  paypal.Fastlane({
    clientId: 'sb',        // ⚠️ remplace en prod
    merchantId: undefined, // ou ton merchantId si tu en as un
    locale: 'fr_FR',
    currency: 'EUR',
  })
}