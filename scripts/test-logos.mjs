#!/usr/bin/env node
/**
 * Script para testar buscas de logos na API SVGL
 */

const servicesToTest = [
  "Adobe",
  "RubyGems", 
  "Salesforce",
  "VSCO",
  "Beacons",
  "Octopus",
  "Manus",
  "Auth0",
  "Okta",
  "Stripe",
  "Postmark",
  "Fastly",
  "Neon"
];

async function testSVGL(searchTerm) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://api.svgl.app/?search=${encodeURIComponent(searchTerm.toLowerCase())}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data) && data.length > 0) {
        return {
          found: true,
          term: searchTerm,
          results: data.slice(0, 3).map(r => ({
            title: r.title,
            route: r.route,
            category: r.category
          }))
        };
      }
    }
    return { found: false, term: searchTerm, error: response.status };
  } catch (error) {
    return { found: false, term: searchTerm, error: error.message };
  }
}

async function main() {
  console.log("🎨 Testando buscas de logos na SVGL API\n");
  
  for (const service of servicesToTest) {
    const result = await testSVGL(service);
    
    if (result.found) {
      console.log(`✅ ${result.term}:`);
      result.results.forEach(r => {
        console.log(`   ${r.title} (${r.category})`);
        console.log(`   → ${r.route}`);
      });
    } else {
      console.log(`❌ ${result.term}: ${result.error || "Not found"}`);
      
      // Try alternative searches
      const alternatives = [
        service.toLowerCase(),
        service.replace(/\s+/g, "").toLowerCase(),
        service.replace(/\s+/g, "-").toLowerCase(),
      ];
      
      for (const alt of alternatives) {
        if (alt !== service.toLowerCase()) {
          const altResult = await testSVGL(alt);
          if (altResult.found) {
            console.log(`   💡 Encontrado com: "${alt}"`);
            altResult.results.slice(0, 1).forEach(r => {
              console.log(`      → ${r.route}`);
            });
            break;
          }
        }
      }
    }
    console.log();
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 300));
  }
}

main().catch(console.error);
