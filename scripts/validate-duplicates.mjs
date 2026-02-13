#!/usr/bin/env node
/**
 * Script de validação completo para sites.ts
 * Verifica:
 * - Nomes duplicados (case-insensitive)
 * - URLs duplicadas
 * - URLs malformadas
 * - URLs sem HTTPS
 * - Categorias vazias ou inconsistentes
 * - statusPageType inválidos
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITES_FILE = path.join(__dirname, "..", "data", "sites.ts");

// Categorias aceitas (pode ser expandido)
const VALID_CATEGORIES = [
  "AI Code Editor", "AI/ML", "Analytics", "Authentication", "Automation",
  "CDN", "CI/CD", "CMS", "Cloud Provider", "Communication", "Communication API",
  "Container Registry", "Database", "Design", "Developer Platform",
  "Developer Tools", "Development Tools", "E-commerce", "Email", "Game Development",
  "Gaming", "Government", "Hosting", "Infrastructure", "Media", "Meta", "Microsoft", "Monitoring",
  "Package Manager", "Payment", "Productivity", "Project Management",
  "Real-time", "Search", "Security", "Social", "Streaming", "Testing",
  "Version Control"
];

// Tipos de status page válidos
const VALID_STATUS_PAGE_TYPES = [
  "atlassian", "custom", "google", "microsoft", "incidentio",
  "apple", "hotmart", "appmax", "postmark", "openstatus",
  "statusio", "betterstack", "instatus", "statuspal", "onlineornot",
  "paypal", "salesforce", "ohdear", "pagerduty", "xbox", "playstation",
  "uptimekuma"
];

function extractWebsitesFromFile(content) {
  const websites = [];

  // Regex melhorado para capturar todas as propriedades
  const websiteRegex = /\{\s*name:\s*"([^"]+)"[^}]*url:\s*[`"]([^`"\s]+)[`"][^}]*category:\s*"([^"]+)"[^}]*\}/gs;
  let match;

  while ((match = websiteRegex.exec(content)) !== null) {
    const blockStart = content.lastIndexOf("{", match.index);
    const block = content.substring(blockStart, match.index + match[0].length);
    
    // Extrai statusPageType se existir
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

function normalizeUrl(url) {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .replace(/\/api\/v2\/summary\.json$/, "");
}

// URLs que podem ter múltiplos serviços compartilhando a mesma página de status
const ALLOWED_SHARED_STATUS_PAGES = [
  "status.cloud.google.com",
  "www.google.com/appsstatus/dashboard",
  "status.cloud.microsoft/m365",
  "metastatus.com",
  "health.aws.amazon.com/health/status",
];

function normalizeName(name) {
  return name.toLowerCase().trim();
}

function isAllowedSharedStatusPage(url) {
  const normalizedUrl = normalizeUrl(url);
  return ALLOWED_SHARED_STATUS_PAGES.some((allowed) =>
    normalizedUrl.includes(allowed)
  );
}

function findDuplicates(websites) {
  const errors = [];
  const nameMap = new Map();
  const urlMap = new Map();

  for (const site of websites) {
    const normalizedName = normalizeName(site.name);
    const normalizedUrl = normalizeUrl(site.url);

    // Verifica nomes duplicados
    if (nameMap.has(normalizedName)) {
      const existing = nameMap.get(normalizedName);
      errors.push({
        type: "Nome duplicado",
        severity: "error",
        name: site.name,
        lines: [existing.line, site.line],
        message: `"${site.name}" aparece nas linhas ${existing.line} e ${site.line}`,
      });
    } else {
      nameMap.set(normalizedName, site);
    }

    // Verifica URLs duplicadas (exceto para páginas de status compartilhadas)
    if (urlMap.has(normalizedUrl) && !isAllowedSharedStatusPage(site.url)) {
      const existing = urlMap.get(normalizedUrl);
      // Só reporta se for nome diferente (mesmo serviço, nomes diferentes)
      if (normalizeName(existing.name) !== normalizedName) {
        errors.push({
          type: "URL duplicada",
          severity: "error",
          url: site.url,
          names: [existing.name, site.name],
          lines: [existing.line, site.line],
          message: `URL "${site.url}" usada por "${existing.name}" (linha ${existing.line}) e "${site.name}" (linha ${site.line})`,
        });
      }
    } else {
      urlMap.set(normalizedUrl, site);
    }
  }

  return errors;
}

function validateUrls(websites) {
  const errors = [];
  
  for (const site of websites) {
    // Verifica se a URL é válida
    try {
      new URL(site.url);
    } catch {
      errors.push({
        type: "URL malformada",
        severity: "error",
        name: site.name,
        line: site.line,
        message: `"${site.name}" (linha ${site.line}) tem URL malformada: "${site.url}"`,
      });
      continue;
    }
    
    // Verifica se usa HTTPS
    if (!site.url.startsWith("https://")) {
      errors.push({
        type: "URL sem HTTPS",
        severity: "warning",
        name: site.name,
        line: site.line,
        message: `"${site.name}" (linha ${site.line}) não usa HTTPS: "${site.url}"`,
      });
    }
  }
  
  return errors;
}

function validateCategories(websites) {
  const errors = [];
  const usedCategories = new Set();
  
  for (const site of websites) {
    // Verifica categoria vazia
    if (!site.category || site.category.trim() === "") {
      errors.push({
        type: "Categoria vazia",
        severity: "error",
        name: site.name,
        line: site.line,
        message: `"${site.name}" (linha ${site.line}) não tem categoria definida`,
      });
      continue;
    }
    
    // Verifica se categoria está na lista permitida
    if (!VALID_CATEGORIES.includes(site.category)) {
      errors.push({
        type: "Categoria não listada",
        severity: "warning",
        name: site.name,
        line: site.line,
        message: `"${site.name}" (linha ${site.line}) usa categoria "${site.category}" não listada em VALID_CATEGORIES`,
      });
    }
    
    usedCategories.add(site.category);
  }
  
  return { errors, usedCategories: Array.from(usedCategories).sort() };
}

function validateStatusPageTypes(websites) {
  const errors = [];
  
  for (const site of websites) {
    if (site.statusPageType && !VALID_STATUS_PAGE_TYPES.includes(site.statusPageType)) {
      errors.push({
        type: "statusPageType inválido",
        severity: "error",
        name: site.name,
        line: site.line,
        message: `"${site.name}" (linha ${site.line}) usa statusPageType inválido: "${site.statusPageType}"`,
      });
    }
  }
  
  return errors;
}

function main() {
  console.log("🔍 Validando sites.ts...\n");

  if (!fs.existsSync(SITES_FILE)) {
    console.error(`❌ Arquivo não encontrado: ${SITES_FILE}`);
    process.exit(1);
  }

  const content = fs.readFileSync(SITES_FILE, "utf-8");
  const websites = extractWebsitesFromFile(content);

  console.log(`📊 Total de sites encontrados: ${websites.length}`);

  // Executa todas as validações
  const allErrors = [];
  
  // 1. Duplicados
  const duplicates = findDuplicates(websites);
  allErrors.push(...duplicates);
  
  // 2. URLs
  const urlErrors = validateUrls(websites);
  allErrors.push(...urlErrors);
  
  // 3. Categorias
  const { errors: categoryErrors, usedCategories } = validateCategories(websites);
  allErrors.push(...categoryErrors);
  
  // 4. Status page types
  const typeErrors = validateStatusPageTypes(websites);
  allErrors.push(...typeErrors);

  // Separa erros e warnings
  const errors = allErrors.filter(e => e.severity === "error");
  const warnings = allErrors.filter(e => e.severity === "warning");

  console.log(`   Categorias usadas: ${usedCategories.length}`);
  console.log(`   Erros: ${errors.length} | Avisos: ${warnings.length}\n`);

  // Mostra categorias
  if (usedCategories.length > 0) {
    console.log("📋 Categorias:");
    usedCategories.forEach(cat => console.log(`   • ${cat}`));
    console.log();
  }

  // Mostra erros
  if (errors.length > 0) {
    console.log(`❌ ${errors.length} erro(s) encontrado(s):\n`);
    errors.forEach(error => {
      console.log(`  [${error.type}] ❌`);
      console.log(`   ${error.message}\n`);
    });
  }

  // Mostra warnings
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} aviso(s):\n`);
    warnings.forEach(error => {
      console.log(`  [${error.type}] ⚠️`);
      console.log(`   ${error.message}\n`);
    });
  }

  // Dicas
  if (errors.length > 0 || warnings.length > 0) {
    console.log("💡 Dicas:");
    console.log("   • URLs duplicadas: atualize a existente em vez de criar nova");
    console.log("   • Categorias não listadas: verifique se é realmente necessária");
    console.log("   • HTTPS: sempre prefira URLs seguras");
    console.log("   • Veja CONTRIBUTING.md para mais detalhes\n");
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("✅ Validação passou com sucesso!");
    process.exit(0);
  } else if (errors.length === 0) {
    console.log("✅ Sem erros, apenas avisos.");
    process.exit(0);
  } else {
    console.log(`❌ Validação falhou com ${errors.length} erro(s).`);
    process.exit(1);
  }
}

main();
