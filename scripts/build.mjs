import { cp, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const out = new URL("../dist/", import.meta.url);
await mkdir(out, { recursive: true });
for (const file of ["index.html", "styles.css", "app.js", "admin.html", "admin.css", "admin.js", "_headers", "impressum.html", "datenschutz.html"]) {
  if (existsSync(new URL(`../${file}`, import.meta.url))) {
    await cp(new URL(`../${file}`, import.meta.url), new URL(file, out));
  }
}
const url = process.env.SUPABASE_URL || "https://faphmmhhhqpvmmbilnlk.supabase.co";
const key = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_msNfNa6tj6vVJXINk6VZDAaApCZppyJXluIQUY";
await writeFile(new URL("config.js", out), `window.HOF_CONFIG = { supabaseUrl: ${JSON.stringify(url)}, supabasePublishableKey: ${JSON.stringify(key)} };\n`);
console.log("Static site built to dist/");
