#!/usr/bin/env node
// Testar logo do Gemini
async function testGemini() {
  const response = await fetch('https://api.svgl.app/?search=gemini');
  const data = await response.json();
  console.log('Gemini:', data[0]);
}
testGemini();
