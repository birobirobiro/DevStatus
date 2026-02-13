#!/usr/bin/env node
/**
 * Testar fluxo completo de busca de logos
 */

// Simular o generateSearchTerms
function generateSearchTerms(serviceName) {
  const name = serviceName.toLowerCase();
  const terms = new Set();

  terms.add(name);

  const cleanName = name.replace(/\b(status|api|developer|platform|service|app|inc|corp|ltd|llc)\b/g, "").trim();
  if (cleanName) terms.add(cleanName);

  terms.add(name.replace(/\s+/g, ""));
  terms.add(name.replace(/\s+/g, "-"));
  terms.add(name.replace(/\s+/g, "_"));

  const firstWord = name.split(" ")[0];
  if (firstWord.length > 2) terms.add(firstWord);

  const mappings = {
    adobe: ["adobe"],
    openai: ["openai"],
  };

  if (mappings[name]) {
    mappings[name].forEach((term) => terms.add(term));
  }

  return Array.from(terms).filter((term) => term.length > 1);
}

async function testLogoFetch(serviceName) {
  console.log(`\n🔍 Testando: ${serviceName}`);
  const terms = generateSearchTerms(serviceName);
  console.log(`   Termos gerados: ${terms.join(", ")}`);

  for (const term of terms) {
    try {
      const response = await fetch(`https://api.svgl.app/?search=${encodeURIComponent(term)}`, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
          const item = data[0];
          console.log(`   ✅ Encontrado com "${term}": ${item.title}`);
          
          // Test the parsing logic
          let logoUrl;
          if (item.route && typeof item.route === "object") {
            logoUrl = item.route.light || item.route.dark;
            console.log(`      URL (objeto): ${logoUrl}`);
          } else if (item.route && typeof item.route === "string") {
            logoUrl = item.route;
            console.log(`      URL (string): ${logoUrl}`);
          } else if (item.src) {
            logoUrl = item.src;
            console.log(`      URL (src): ${logoUrl}`);
          }
          
          return { success: true, term, url: logoUrl };
        }
      }
    } catch (error) {
      console.log(`   ❌ Erro com "${term}": ${error.message}`);
    }
  }

  return { success: false };
}

async function main() {
  console.log("🎨 Testando busca de logos\n");
  
  const results = await Promise.all([
    testLogoFetch("Adobe"),
    testLogoFetch("OpenAI"),
  ]);
  
  console.log("\n📊 Resumo:");
  results.forEach((result, i) => {
    const name = i === 0 ? "Adobe" : "OpenAI";
    if (result.success) {
      console.log(`✅ ${name}: ${result.url}`);
    } else {
      console.log(`❌ ${name}: Não encontrado`);
    }
  });
}

main().catch(console.error);
