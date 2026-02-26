import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capturar logs do console
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
  });
  
  // Capturar erros de página
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });
  
  console.log('Acessando http://localhost:3000...');
  await page.goto('http://localhost:3000');
  
  // 1. Login
  console.log('Fazendo login...');
  const loginTab = page.getByRole('button', { name: 'Login', exact: true });
  await loginTab.click();
  
  const nicknameInput = page.getByPlaceholder('Digite seu nickname');
  await nicknameInput.fill('alexandre');
  
  const loginButton = page.getByRole('button', { name: 'Entrar com Nickname' });
  await loginButton.click();
  
  // Aguardar login
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Encontrar e clicar no menu
  const menuIcon = page.locator('div[style*="background-color: rgb(78, 205, 196)"]')
    .filter({ has: page.locator('svg') })
    .first();
  
  console.log('Clicando no menu...');
  await menuIcon.click();
  await page.waitForTimeout(1000);
  
  // Clicar em Usuários
  console.log('Clicando em "Usuários"...');
  const usersOption = page.getByText('Usuários').first();
  await usersOption.click();
  await page.waitForTimeout(2000);
  
  // Verificar se há algum elemento de erro
  const errorElements = await page.getByText('Erro', 'Error', 'error', { ignoreCase: true }).all();
  console.log(`Elementos de erro encontrados: ${errorElements.length}`);
  
  await browser.close();
})();
