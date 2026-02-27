import { test, expect, Page } from '@playwright/test';

test.describe('Debug - Teste de usuários', () => {
  test.setTimeout(60000);

  test('debug - verificar elementos básicos após login', async ({ page }) => {
    console.log('=== INICIANDO TESTE DE DEBUG ===');
    
    // 1. Acessar página inicial
    await page.goto('/');
    console.log('Página carregada:', await page.title());
    
    // Verificar título
    await expect(page).toHaveTitle('Sistema de Gestão de Tarefas');
    console.log('Título verificado');
    
    // 2. Fazer login
    const loginTab = page.getByRole('button', { name: 'Login', exact: true });
    await loginTab.click();
    console.log('Tab Login clicada');
    
    const nicknameInput = page.getByPlaceholder('Digite seu nickname');
    await nicknameInput.fill('alexandre');
    console.log('Nickname preenchido');
    
    const loginButton = page.getByRole('button', { name: 'Entrar com Nickname' });
    await loginButton.click();
    console.log('Botão login clicado');
    
    // 3. Aguardar login
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    console.log('Aguardou 5s após login');
    
    // 4. Tirar screenshot para debug
    await page.screenshot({ path: 'debug-after-login.png', fullPage: true });
    console.log('Screenshot salvo: debug-after-login.png');
    
    // 5. Verificar elementos visíveis na página
    console.log('=== VERIFICANDO ELEMENTOS ===');
    
    // Verificar se há algum heading
    const headings = page.getByRole('heading');
    const headingCount = await headings.count();
    console.log(`Número de headings: ${headingCount}`);
    
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const text = await heading.textContent();
      console.log(`Heading ${i}: "${text?.substring(0, 50)}..."`);
    }
    
    // Verificar ícones SVG (menu flutuante)
    const svgIcons = page.locator('svg');
    const svgCount = await svgIcons.count();
    console.log(`Número de ícones SVG: ${svgCount}`);
    
    // Verificar divs com estilo
    const divsWithStyle = page.locator('div[style]');
    const divCount = await divsWithStyle.count();
    console.log(`Número de divs com estilo: ${divCount}`);
    
    // Procurar div que pode ser o menu flutuante
    const possibleMenuDivs = page.locator('div').filter({ has: page.locator('svg') });
    const possibleMenuCount = await possibleMenuDivs.count();
    console.log(`Número de divs com SVG: ${possibleMenuCount}`);
    
    for (let i = 0; i < Math.min(possibleMenuCount, 10); i++) {
      const div = possibleMenuDivs.nth(i);
      const style = await div.getAttribute('style');
      const hasBgColor = style?.includes('background-color');
      console.log(`Div ${i}: style contém background-color? ${hasBgColor}, style: ${style?.substring(0, 100)}...`);
    }
    
    // 6. Tentar encontrar menu flutuante por características específicas
    // Pelo código do FloatingMenu.tsx, o ícone tem:
    // - width: '40px', height: '40px', backgroundColor: '#4ECDC4' ou '#3DB8AC'
    const menuCandidates = page.locator('div').filter({ 
      has: page.locator('svg'),
      hasNot: page.locator('button')
    });
    
    const candidateCount = await menuCandidates.count();
    console.log(`Candidatos a menu: ${candidateCount}`);
    
    // Tentar clicar no primeiro candidato
    if (candidateCount > 0) {
      const firstCandidate = menuCandidates.first();
      await firstCandidate.click();
      console.log('Clicou no primeiro candidato');
      await page.waitForTimeout(1000);
      
      // Verificar se apareceu "Configurações"
      const configText = page.getByText('Configurações');
      const configCount = await configText.count();
      console.log(`Texto "Configurações" encontrado: ${configCount} vezes`);
      
      if (configCount > 0) {
        console.log('SUCESSO: Menu flutuante aberto!');
      } else {
        console.log('Menu não abriu ou "Configurações" não visível');
      }
    }
    
    // 7. Outra abordagem: buscar por botões com texto específico
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`Número total de botões: ${buttonCount}`);
    
    for (let i = 0; i < Math.min(buttonCount, 20); i++) {
      const button = allButtons.nth(i);
      const text = await button.textContent();
      console.log(`Botão ${i}: "${text?.substring(0, 30)}..."`);
    }
    
    console.log('=== FIM DO DEBUG ===');
  });
});