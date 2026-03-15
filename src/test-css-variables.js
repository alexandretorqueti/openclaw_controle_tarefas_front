// Teste para verificar se as variáveis CSS estão funcionando
function testCSSVariables() {
  console.log('🔍 Testando variáveis CSS...');
  
  // Obter o elemento root
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  // Lista de variáveis para testar
  const variables = [
    '--bg-primary',
    '--bg-secondary', 
    '--bg-card',
    '--bg-input',
    '--text-primary',
    '--text-secondary',
    '--border-color',
    '--accent-color',
    '--accent-hover',
    '--danger-color',
    '--success-color'
  ];
  
  let allPassed = true;
  
  variables.forEach(variable => {
    const value = computedStyle.getPropertyValue(variable).trim();
    if (value) {
      console.log(`✅ ${variable}: ${value}`);
    } else {
      console.log(`❌ ${variable}: NÃO DEFINIDA`);
      allPassed = false;
    }
  });
  
  if (allPassed) {
    console.log('🎉 Todas as variáveis CSS estão definidas!');
  } else {
    console.log('⚠️ Algumas variáveis CSS não estão definidas');
  }
  
  return allPassed;
}

// Executar teste quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testCSSVariables);
} else {
  testCSSVariables();
}
