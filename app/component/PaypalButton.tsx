// app/component/PaypalButton.tsx
"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    paypal?: any;
  }
}

type Props = {
  /** Montant TTC en euros (ex: 49.99) */
  total: number;
  /** URL de redirection après succès */
  successRedirectUrl?: string;
};

/**
 * Bouton PayPal autonome et robuste.
 * - Charge le SDK une seule fois
 * - Vérifie/normalise le montant
 * - Journalise les erreurs (console)
 * - Redirige vers successRedirectUrl avec ?total=&email=&name=
 */
export default function PaypalButton({
  total,
  successRedirectUrl = "/success",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function ensureSdk() {
      // Évite le double-inject
      const existing = document.getElementById(
        "paypal-sdk"
      ) as HTMLScriptElement | null;

      // Si le SDK est déjà chargé, on sort
      if (existing && window.paypal) {
        return;
      }

      // Si un script existe mais paypal pas encore présent, attendre son onload
      if (existing && !window.paypal) {
        await new Promise<void>((resolve) => {
          existing.addEventListener("load", () => resolve(), { once: true });
        });
        return;
      }

      // Injecter le SDK
      const clientId =
        (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "sb").trim();

      const script = document.createElement("script");
      script.id = "paypal-sdk";
      // Fastlane retiré pour stabiliser le flux — à réactiver plus tard si besoin.
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        clientId
      )}&currency=EUR&components=buttons&locale=fr_FR`;
      script.async = true;

      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          console.log("[PayPal SDK] loaded, paypal =", !!window.paypal);
          resolve();
        };
        script.onerror = (ev) => {
          console.error("[PayPal SDK] failed to load", ev);
          reject(new Error("Failed to load PayPal SDK"));
        };
        document.body.appendChild(script);
      });
    }

    async function renderButtons() {
      if (!containerRef.current) return;

      // Nettoie une éventuelle instance précédente
      if (buttonsRef.current && typeof buttonsRef.current.close === "function") {
        try {
          buttonsRef.current.close();
        } catch {}
        buttonsRef.current = null;
      }
      containerRef.current.innerHTML = "";

      // Validation du montant
      const amount = Number.isFinite(total) ? Number(total) : 0;
      if (!amount || amount <= 0) {
        console.warn("[PayPal] Montant invalide:", total);
        containerRef.current.innerHTML =
          '<div style="color:#a00">Montant invalide</div>';
        return;
      }

      if (!window.paypal) {
        console.warn("[PayPal] SDK non initialisé");
        containerRef.current.innerHTML =
          '<div style="color:#a00">SDK PayPal non chargé</div>';
        return;
      }

      // Création des boutons
      buttonsRef.current = window.paypal.Buttons({
        style: {
          layout: "horizontal",
          color: "gold",
          shape: "pill",
          label: "paypal",
          tagline: false,
        },

        // Création de la commande côté client (simple et efficace pour démarrer)
        createOrder: (_data: any, actions: any) => {
          const value = amount.toFixed(2); // PayPal attend une chaîne décimale
          return actions.order.create({
            purchase_units: [
              {
                amount: { value, currency_code: "EUR" },
              },
            ],
            application_context: { shipping_preference: "NO_SHIPPING" },
          });
        },

        // Capture et redirection
        onApprove: async (_data: any, actions: any) => {
          try {
            const order = await actions.order.capture();
            console.log("[PayPal] capture OK:", order);

            const payer = order?.payer ?? {};
            const email = payer?.email_address ?? "";
            const name = [payer?.name?.given_name, payer?.name?.surname]
              .filter(Boolean)
              .join(" ");

            const params = new URLSearchParams({
              total: amount.toFixed(2),
              email,
              name,
            });

            window.location.href = `${successRedirectUrl}?${params.toString()}`;
          } catch (e: any) {
            console.error("[PayPal] capture ERROR:", e);
            alert("Erreur lors de la capture du paiement.");
          }
        },

        onError: (err: unknown) => {
          console.error("[PayPal] onError:", err);
          alert("Paiement PayPal impossible pour le moment.");
        },
      });

      try {
        await buttonsRef.current.render(containerRef.current);
      } catch (e) {
        console.error("[PayPal] render ERROR:", e);
        containerRef.current.innerHTML =
          '<div style="color:#a00">Impossible d’afficher le bouton PayPal</div>';
      }
    }

    // Séquence: charger le SDK puis rendre les boutons
    ensureSdk()
      .then(() => {
        if (!cancelled) return renderButtons();
      })
      .catch((e) => {
        console.error("[PayPal] SDK load ERROR:", e);
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<div style="color:#a00">Échec de chargement du SDK PayPal</div>';
        }
      });

    return () => {
      cancelled = true;
      if (buttonsRef.current && typeof buttonsRef.current.close === "function") {
        try {
          buttonsRef.current.close();
        } catch {}
        buttonsRef.current = null;
      }
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [total, successRedirectUrl]);

  return <div ref={containerRef} />;
}
