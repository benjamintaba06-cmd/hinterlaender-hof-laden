# Adminzugang einrichten

1. Im Supabase-Dashboard das Projekt `hinterlaender-hof-laden` öffnen.
2. Unter **Authentication → Users** einen eigenen Benutzer mit der gewünschten Admin-E-Mail anlegen und eine sichere Einladung bzw. ein sicheres Passwort verwenden.
3. Beim Benutzer ausschließlich die **App Metadata** bearbeiten und dort den JSON-Wert setzen:

```json
{ "role": "admin" }
```

4. Nicht `User Metadata` verwenden: Diese Angaben können vom Benutzer selbst geändert werden und sind keine sichere Grundlage für Berechtigungen.
5. Die Adminoberfläche unter `/admin.html` öffnen und mit diesem Benutzer anmelden.

Die Oberfläche prüft `user.app_metadata.role === "admin"`. Dieselbe serverseitige JWT-Angabe wird von den RLS-Policies für Produkte, Bestellungen und Bestellpositionen geprüft.

## Sicherheitshinweise

- Niemals den Supabase Secret-/Service-Role-Key in `config.js`, Cloudflare Pages oder Browsercode eintragen.
- Admin-Zugang nur für ausdrücklich berechtigte Personen vergeben.
- Nach Änderung der App Metadata neu anmelden, damit ein aktualisierter JWT-Claim vorliegt.
- Checkout und öffentliche Bestellerstellung sind noch nicht freigeschaltet. Bestellungen dürfen nicht direkt aus einem untrusted Browser-Client erstellt werden; dafür wird eine serverseitige Edge Function mit Preis- und Bestandsprüfung benötigt.
