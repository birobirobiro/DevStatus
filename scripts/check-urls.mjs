#!/usr/bin/env node
/**
 * Script para verificar se as URLs de status estão funcionando
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITES_FILE = path.join(__dirname, "..", "data", "sites.ts");

function extractWebsites(content) {
  const websites = [];
  const websiteRegex = /\{\s*name:\s*"([^"]+)"[^}]*url:\s*[`"]([^`"\s]+)[`"][^}]*category:\s*"([^"]+)"[^}]*\}/gs;
  let match;

  while ((match = websiteRegex.exec(content)) !== null) {
    const blockStart = content.lastIndexOf("{", match.index);
    const block = content.substring(blockStart, match.index + match[0].length);
    const statusTypeMatch = block.match(/statusPageType:\s*["']([^"']+)["']/);
    const statusPageType = statusTypeMatch ? statusTypeMatch[1] : null;

    websites.push({
      name: match[1],
      url: match[2].replace(/\$\{[^}]+\}/g, "api/v2/summary.json"),
      category: match[3],
      statusPageType,
      line: content.substring(0, match.index).split("\n").length,
    });
  }

  return websites;
}

async function testUrl(url, statusPageType) {
  // URLs de páginas externas (custom, google, microsoft, etc.) não precisam ser testadas
  const externalTypes = ["custom", "google", "microsoft", "apple", "azure", "jenkins", "adobe", "sketch"];
  if (externalTypes.includes(statusPageType)) {
    return { status: "skip", message: "Tipo externo - não testável" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json().catch(() => null);
      if (data && (data.status || data.page)) {
        return { status: "ok", message: "API funcionando" };
      }
      return { status: "ok", message: "URL acessível mas formato desconhecido" };
    }

    return { status: "error", message: `HTTP ${response.status}` };
  } catch (error) {
    if (error.name === "AbortError") {
      return { status: "error", message: "Timeout" };
    }
    return { status: "error", message: error.message };
  }
}

async function main() {
  console.log("🔍 Verificando URLs de status...\n");

  const content = fs.readFileSync(SITES_FILE, "utf-8");
  const websites = extractWebsites(content);

  const results = [];
  const errors = [];

  for (const site of websites) {
    const result = await testUrl(site.url, site.statusPageType);
    results.push({ ...site, ...result });

    if (result.status === "error" && site.statusPageType !== "custom") {
      errors.push(site);
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  // Mostrar resultados
  console.log(`📊 Verificados: ${results.length}\n`);

  // URLs com erro
  const errorSites = results.filter(r => r.status === "error");
  if (errorSites.length > 0) {
    console.log(`❌ ${errorSites.length} URLs com erro:\n`);
    for (const site of errorSites) {
      console.log(`   [${site.category}] ${site.name}`);
      console.log(`   URL: ${site.url}`);
      console.log(`   Tipo: ${site.statusPageType || "atlassian"}`);
      console.log(`   Erro: ${site.message}\n`);
    }
  }

  // URLs puladas (tipos externos)
  const skippedSites = results.filter(r => r.status === "skip");
  if (skippedSites.length > 0) {
    console.log(`⏭️  ${skippedSites.length} URLs puladas (tipos externos)\n`);
  }

  // URLs OK
  const okSites = results.filter(r => r.status === "ok");
  console.log(`✅ ${okSites.length} URLs funcionando`);

  // Resumo de problemas potenciais
  console.log("\n📋 Possíveis problemas:");
  errors.forEach(site => {
    console.log(`   • ${site.name} (${site.category}): ${site.url}`);
  });

  if (errors.length === 0) {
    console.log("   Nenhum problema encontrado!");
  }
}

main().catch(console.error);
