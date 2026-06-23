import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const rootConfigPath = join(projectRoot, "wrangler.json");
const generatedConfigPath = join(projectRoot, "dist", "client", "wrangler.json");

const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"));

const rootConfig = existsSync(rootConfigPath) ? readJson(rootConfigPath) : {};

if (!existsSync(generatedConfigPath)) {
  throw new Error(
    "No se encontro dist/client/wrangler.json. El build de TanStack Start debe generar la configuracion SSR antes de publicar en Cloudflare Pages.",
  );
}

const generatedConfig = readJson(generatedConfigPath);

const allowedTopLevelFields = new Set([
  "$schema",
  "name",
  "main",
  "assets",
  "compatibility_date",
  "compatibility_flags",
  "observability",
  "upload_source_maps",
  "keep_vars",
  "minify",
  "logpush",
  "limits",
  "placement",
  "vars",
  "durable_objects",
  "migrations",
  "kv_namespaces",
  "r2_buckets",
  "d1_databases",
  "vectorize",
  "hyperdrive",
  "services",
  "queues",
  "analytics_engine_datasets",
  "dispatch_namespaces",
  "mtls_certificates",
  "browser",
  "ai",
  "version_metadata",
  "send_metrics",
  "tail_consumers",
  "unsafe",
  "triggers",
]);

const cleanedConfig = {};

for (const [key, value] of Object.entries(generatedConfig)) {
  if (allowedTopLevelFields.has(key)) {
    cleanedConfig[key] = value;
  }
}

cleanedConfig.name = rootConfig.name || generatedConfig.name || "unidos-piribebuy-web";
cleanedConfig.compatibility_date =
  rootConfig.compatibility_date || generatedConfig.compatibility_date || "2026-04-29";
cleanedConfig.compatibility_flags =
  rootConfig.compatibility_flags || generatedConfig.compatibility_flags || ["nodejs_compat"];

if (cleanedConfig.dev) {
  delete cleanedConfig.dev;
}

if (
  cleanedConfig.triggers &&
  (!Array.isArray(cleanedConfig.triggers.crons) || cleanedConfig.triggers.crons.length === 0)
) {
  delete cleanedConfig.triggers;
}

if (!cleanedConfig.main) {
  throw new Error(
    "La configuracion generada no contiene main. No se debe publicar esta app como sitio estatico porque TanStack Start necesita SSR.",
  );
}

if (!cleanedConfig.assets) {
  console.warn(
    "Advertencia: la configuracion generada no contiene assets. Se conserva el Worker SSR generado, pero revise la salida si faltan archivos publicos.",
  );
}

writeFileSync(generatedConfigPath, `${JSON.stringify(cleanedConfig, null, 2)}\n`, "utf8");

console.log("Sanitized generated dist/client/wrangler.json for Cloudflare Pages SSR deploy.");
