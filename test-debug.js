const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Acessando http://localhost:3000...');
  await page.goto('http://localhost:3000');
  
  console.log('Título da página:', await page.title());
  
  // Aguardar carregamento
  await page.waitForLoadState('networkidle');
  
  // Verificar se há elementos com texto "Login"
  const loginButtons = await page.getByText('Login').all();
  console.log(`Encontrados ${loginButtons.length} botões com texto "Login"`);
  
  // Verificar se há elementos com role button
  const allButtons = await page.getByRole('button').all();
  console.log(`Total de botões na página: ${allButtons.length}`);
  
  // Tirar screenshot
  await page.screenshot({ path: 'debug-home.png' });
  console.log('Screenshot salvo em debug-home.png');
  
  // Fechar após 5 segundos
  setTimeout(async () => {
    await browser.close();
  }, 5000);
})();
