import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capturar logs
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
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
  
  // Verificar botão Usuários
  const usersButtons = await page.getByText('Usuários').all();
  console.log(`Encontrados ${usersButtons.length} botões com texto "Usuários"`);
  
  // Verificar propriedades do primeiro botão Usuários
  if (usersButtons.length > 0) {
    const firstUserButton = usersButtons[0];
    const tagName = await firstUserButton.evaluate(el => el.tagName);
    const buttonType = await firstUserButton.evaluate(el => el.type || 'N/A');
    const hasOnClick = await firstUserButton.evaluate(el => !!el.onclick);
    const onClickAttr = await firstUserButton.evaluate(el => el.getAttribute('onclick'));
    
    console.log('Primeiro botão Usuários:');
    console.log('  Tag:', tagName);
    console.log('  Type:', buttonType);
    console.log('  Tem onclick handler?', hasOnClick);
    console.log('  Atributo onclick:', onClickAttr);
    
    // Verificar estilos
    const computedStyle = await firstUserButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        pointerEvents: style.pointerEvents,
        cursor: style.cursor
      };
    });
    
    console.log('  Estilos:', computedStyle);
    
    // Verificar se está visível
    const isVisible = await firstUserButton.isVisible();
    console.log('  Está visível?', isVisible);
    
    // Verificar bounding box
    const boundingBox = await firstUserButton.boundingBox();
    console.log('  Bounding box:', boundingBox);
    
    // Clicar no botão
    console.log('Clicando no botão Usuários...');
    await firstUserButton.click();
    await page.waitForTimeout(2000);
    
    // Verificar se algo aconteceu
    const currentUrl = page.url();
    console.log('URL após clique:', currentUrl);
    
    // Verificar logs do console após clique
    console.log('Aguardando logs adicionais...');
    await page.waitForTimeout(1000);
  }
  
  await browser.close();
})();
