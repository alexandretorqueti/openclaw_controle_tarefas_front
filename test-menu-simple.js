const playwright = require('@playwright/test');

(async () => {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('1. Acessando http://localhost:3000...');
    await page.goto('http://localhost:3000');
    
    console.log('2. Clicando na aba Login...');
    const loginTab = page.getByRole('button', { name: 'Login', exact: true });
    await loginTab.click();
    
    console.log('3. Preenchendo nickname...');
    const nicknameInput = page.getByPlaceholder('Digite seu nickname');
    await nicknameInput.fill('alexandre');
    
    console.log('4. Clicando em Entrar...');
    const loginButton = page.getByRole('button', { name: 'Entrar com Nickname' });
    await loginButton.click();
    
    console.log('5. Aguardando carregamento...');
    await page.waitForLoadState('networkidle');
    
    console.log('6. Procurando ícone do menu...');
    // Tentar diferentes seletores para o ícone do menu
    const menuSelectors = [
      'div[style*="background-color"] svg',
      'div:has(svg)',
      '.floating-menu',
      '[data-testid="menu-icon"]'
    ];
    
    let menuIcon = null;
    for (const selector of menuSelectors) {
      menuIcon = page.locator(selector).first();
      if (await menuIcon.count() > 0) {
        console.log(`   Encontrado com seletor: ${selector}`);
        break;
      }
    }
    
    if (!menuIcon || await menuIcon.count() === 0) {
      console.log('❌ Ícone do menu não encontrado');
      await page.screenshot({ path: 'menu-not-found.png', fullPage: true });
      console.log('HTML da página salvo em menu-not-found.html');
      await page.content().then(html => {
        require('fs').writeFileSync('menu-not-found.html', html);
      });
    } else {
      console.log('✅ Ícone do menu encontrado');
      await menuIcon.hover();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'menu-hovered.png', fullPage: true });
      
      // Verificar se menu apareceu
      const menuText = await page.textContent('body');
      if (menuText.includes('Configurações')) {
        console.log('✅ Menu "Configurações" encontrado');
      } else {
        console.log('❌ Menu "Configurações" NÃO encontrado');
      }
    }
    
  } catch (error) {
    console.error('Erro:', error);
    await page.screenshot({ path: 'error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
