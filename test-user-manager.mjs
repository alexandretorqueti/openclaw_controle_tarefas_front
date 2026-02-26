import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
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
  
  // Tirar screenshot
  await page.screenshot({ path: 'debug-before-menu.png' });
  console.log('Screenshot antes do menu salvo');
  
  // Encontrar e clicar no menu
  const menuIcon = page.locator('div[style*="background-color: rgb(78, 205, 196)"]')
    .filter({ has: page.locator('svg') })
    .first();
  
  console.log('Clicando no menu...');
  await menuIcon.click();
  await page.waitForTimeout(1000);
  
  // Verificar se menu abriu
  const configText = page.getByText('Configurações');
  const isConfigVisible = await configText.isVisible();
  console.log('Menu "Configurações" visível?', isConfigVisible);
  
  if (isConfigVisible) {
    // Tirar screenshot do menu aberto
    await page.screenshot({ path: 'debug-menu-open.png' });
    console.log('Screenshot do menu aberto salvo');
    
    // Clicar em Usuários
    console.log('Clicando em "Usuários"...');
    const usersOption = page.getByText('Usuários').first();
    await usersOption.click();
    await page.waitForTimeout(2000);
    
    // Verificar se modal abriu
    const modalText = page.getByText('Gerenciar Usuários');
    const isModalVisible = await modalText.isVisible();
    console.log('Modal "Gerenciar Usuários" visível?', isModalVisible);
    
    if (isModalVisible) {
      await page.screenshot({ path: 'debug-modal-open.png' });
      console.log('Screenshot do modal aberto salvo');
      
      // Verificar conteúdo do modal
      const modalHTML = await page.locator('body').innerHTML();
      console.log('HTML contém "Gerenciar Usuários"?', modalHTML.includes('Gerenciar Usuários'));
      console.log('HTML contém "Usuários Cadastrados"?', modalHTML.includes('Usuários Cadastrados'));
    } else {
      console.log('Modal não abriu. HTML atual:');
      const html = await page.content();
      console.log(html.substring(0, 2000));
    }
  } else {
    console.log('Menu não abriu. Tentando hover...');
    await menuIcon.hover();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'debug-menu-hover.png' });
  }
  
  await browser.close();
})();
