# Hinterländer Hof – Laden

Eigenständiger Hofladen mit GitHub, Cloudflare Pages und Supabase.

## Architektur

- Statisches, mobiloptimiertes Frontend
- Supabase für Produktkatalog, Authentifizierung, Bestellungen und Storage
- Cloudflare Pages für Hosting und Deployment
- PayPal und Banküberweisung als geplante Zahlungsarten

## Lokale Entwicklung

1. Node.js installieren.
2. `npm run build` ausführen.
3. `dist/` lokal über einen statischen Webserver bereitstellen.

Der Build erzeugt `dist/config.js` aus den Umgebungsvariablen `SUPABASE_URL` und `SUPABASE_PUBLISHABLE_KEY`. Ohne Werte bleibt die Seite im Vorschau-Modus ohne Datenbankverbindung.

## Cloudflare Pages

- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables:
  - `SUPABASE_URL` = `https://faphmmhhhqpvmmbilnlk.supabase.co`
  - `SUPABASE_PUBLISHABLE_KEY` = öffentlicher Supabase Publishable Key

**Wichtig:** Niemals Supabase Secret-/Service-Role-Keys im Browser oder in öffentlichen Build-Variablen hinterlegen. Checkout und PayPal werden erst nach Einrichtung serverseitiger Edge Functions aktiviert.

## Datenbank

Das initiale Schema liegt unter `supabase/migrations/`. Die Tabellen `products`, `orders` und `order_items` sind angelegt und RLS ist aktiviert. Öffentliche Besucher können ausschließlich aktive Produkte lesen. Bestellungen sind bis zur Einrichtung einer serverseitigen Checkout-Funktion nicht öffentlich schreibbar.

Neue Supabase-Projekte schalten Tabellen nicht automatisch für die Data API frei. Vor dem Produktivbetrieb muss `public` in den Data API-Einstellungen als exponiertes Schema freigegeben sein; die SQL-Rechte und RLS-Regeln begrenzen den Zugriff zusätzlich.

## Noch offen vor dem Livegang

- Domain und Cloudflare Pages-Projekt verbinden
- Supabase Publishable Key als Cloudflare Environment Variable setzen
- Admin-Benutzer und sichere Admin-Rolle einrichten
- Produkte und Produktbilder einpflegen
- Edge Functions für Gastbestellungen, Preisprüfung, PayPal-Erstellung und PayPal-Webhooks
- IBAN/Überweisungstext sowie Versandkosten und Liefergebiete hinterlegen
- Impressum, Datenschutz, Widerruf und weitere Pflichtinformationen vervollständigen
