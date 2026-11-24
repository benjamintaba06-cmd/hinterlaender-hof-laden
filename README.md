# Hinterländer Hof – Laden

Eigenständiger Hofladen mit GitHub, Cloudflare Pages und Supabase.

## Architektur

- Statisches, mobiloptimiertes Frontend
- Supabase für Produktkatalog, Authentifizierung, Bestellungen und Storage
- Cloudflare Pages für Hosting und Deployment
- PayPal und Banküberweisung als geplante Zahlungsarten

## Lokale Konfiguration

1. `config.example.js` nach `config.js` kopieren.
2. Supabase-Projekt-URL und den öffentlichen Publishable Key eintragen.
3. `config.js` bleibt lokal und wird nicht committed.

**Wichtig:** Keine Supabase-Secret-/Service-Role-Keys im Browser hinterlegen. Checkout und PayPal werden erst nach Einrichtung serverseitiger Edge Functions aktiviert.

## Cloudflare Pages

Build command: leer (statische Seite)
Build output directory: `/`
