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
  
  // Verificar se o modal está no DOM (mesmo que não visível)
  const modalInDOM = await page.evaluate(() => {
    // Procurar por elementos que contenham "Gerenciar Usuários"
    const elements = Array.from(document.querySelectorAll('*'));
    return elements.some(el => el.textContent && el.textContent.includes('Gerenciar Usuários'));
  });
  
  console.log('Modal "Gerenciar Usuários" está no DOM?', modalInDOM);
  
  // Listar todos os textos visíveis na página
  const allTexts = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const texts = elements
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 0);
    return [...new Set(texts)]; // Remover duplicados
  });
  
  console.log('Textos únicos na página (primeiros 20):');
  allTexts.slice(0, 20).forEach(text => console.log('  -', text));
  
  // Verificar estilos de possíveis modais
  const modalElements = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('div'));
    return elements
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.position === 'fixed' || style.position === 'absolute' || 
               style.zIndex > 1000 || el.textContent?.includes('Usuário');
      })
      .map(el => ({
        text: el.textContent?.substring(0, 100),
        position: window.getComputedStyle(el).position,
        zIndex: window.getComputedStyle(el).zIndex,
        display: window.getComputedStyle(el).display,
        opacity: window.getComputedStyle(el).opacity
      }));
  });
  
  console.log('Possíveis elementos de modal encontrados:', modalElements.length);
  modalElements.forEach((el, i) => {
    console.log(`Elemento ${i + 1}:`, el);
  });
  
  await browser.close();
})();
