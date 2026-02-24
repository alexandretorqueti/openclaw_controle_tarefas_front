import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: false });
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
    await page.waitForTimeout(2000);
    
    console.log('6. Tirando screenshot da página após login...');
    await page.screenshot({ path: 'after-login-full.png', fullPage: true });
    
    console.log('7. Procurando ícone do menu...');
    // Primeiro, ver todo o HTML
    const html = await page.content();
    writeFileSync('debug-page.html', html);
    console.log('   HTML salvo em debug-page.html');
    
    // Procurar por elementos que possam ser o menu
    const possibleMenuIcons = await page.$$('div, button, svg');
    console.log(`   ${possibleMenuIcons.length} elementos div/button/svg encontrados`);
    
    // Procurar por texto que indique o menu
    const bodyText = await page.textContent('body');
    if (bodyText.includes('FloatingMenu') || bodyText.includes('Configurações')) {
      console.log('   Texto relacionado ao menu encontrado no body');
    } else {
      console.log('   Texto do menu NÃO encontrado no body');
    }
    
    // Verificar se há algum elemento com estilo de menu
    const styledDivs = await page.$$('div[style*="background"]');
    console.log(`   ${styledDivs.length} divs com estilo de background encontradas`);
    
    for (let i = 0; i < Math.min(styledDivs.length, 5); i++) {
      const style = await styledDivs[i].getAttribute('style');
      console.log(`   Div ${i+1} style: ${style?.substring(0, 100)}...`);
    }
    
    // Tentar encontrar o menu pelo texto "Sistema de Gestão" (deve estar perto)
    const systemTitle = page.getByText('Sistema de Gestão');
    if (await systemTitle.count() > 0) {
      console.log('✅ Título "Sistema de Gestão" encontrado');
      // Procurar elementos próximos
      await systemTitle.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'near-title.png' });
    }
    
  } catch (error) {
    console.error('Erro:', error);
    await page.screenshot({ path: 'error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
