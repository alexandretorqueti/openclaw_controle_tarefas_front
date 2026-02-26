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
  await page.waitForTimeout(2000);
  
  // Verificar se estamos logados - procurar por elementos específicos
  const menuIcon = page.locator('div').filter({ has: page.locator('svg') }).first();
  const isMenuVisible = await menuIcon.isVisible();
  console.log('Ícone do menu visível?', isMenuVisible);
  
  // Tentar encontrar o menu de outras formas
  const allDivsWithSvg = await page.locator('div:has(svg)').count();
  console.log('Total de divs com svg:', allDivsWithSvg);
  
  // Listar todos os svgs
  const allSvgs = await page.locator('svg').all();
  console.log('Total de elementos svg:', allSvgs.length);
  
  // Tirar screenshot após login
  await page.screenshot({ path: 'debug-after-login.png' });
  console.log('Screenshot após login salvo');
  
  // Tentar encontrar o menu pelo estilo ou posição
  const floatingMenu = page.locator('div').filter({ 
    has: page.locator('svg[data-icon="bars"], svg[data-icon="times"]') 
  }).first();
  
  const hasFloatingMenu = await floatingMenu.count();
  console.log('Encontrou menu flutuante?', hasFloatingMenu > 0);
  
  // Verificar HTML da página
  const bodyHtml = await page.locator('body').innerHTML();
  console.log('HTML do body (primeiros 3000 chars):');
  console.log(bodyHtml.substring(0, 3000));
  
  await browser.close();
})();
