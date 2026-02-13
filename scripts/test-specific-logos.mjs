#!/usr/bin/env node
/**
 * Testar buscas específicas de logos
 */

async function testLogoSearch(name) {
  try {
    console.log(`\n🔍 Testando: ${name}`);
    
    // Test 1: Busca exata na SVGL
    const response = await fetch(`https://api.svgl.app/?search=${encodeURIComponent(name.toLowerCase())}`, {
      headers: { Accept: "application/json" },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`✅ SVGL: ${data[0].title}`);
        console.log(`   URL: ${data[0].route || data[0].src}`);
        return true;
      }
    }
    
    console.log(`❌ SVGL: Não encontrado`);
    
    // Test 2: Simple Icons
    const siResponse = await fetch(`https://cdn.simpleicons.org/${encodeURIComponent(name.toLowerCase())}`, {
      method: "HEAD",
    });
    
    if (siResponse.ok) {
      console.log(`✅ Simple Icons: https://cdn.simpleicons.org/${name.toLowerCase()}`);
      return true;
    }
    
    console.log(`❌ Simple Icons: Não encontrado`);
    return false;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🎨 Testando logos específicos\n");
  
  await testLogoSearch("adobe");
  await testLogoSearch("openai");
  await testLogoSearch("Adobe");
  await testLogoSearch("OpenAI");
  
  console.log("\n✅ Teste completo");
}

main().catch(console.error);
