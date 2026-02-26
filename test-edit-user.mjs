import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('=== TESTE EDIÇÃO DE USUÁRIO ===');
  console.log('Acessando http://localhost:3000...');
  await page.goto('http://localhost:3000');
  
  // 1. Login
  console.log('\n1. Fazendo login...');
  const loginTab = page.getByRole('button', { name: 'Login', exact: true });
  await loginTab.click();
  
  const nicknameInput = page.getByPlaceholder('Digite seu nickname');
  await nicknameInput.fill('alexandre');
  
  const loginButton = page.getByRole('button', { name: 'Entrar com Nickname' });
  await loginButton.click();
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // 2. Abrir menu e gerenciador de usuários
  console.log('\n2. Abrindo gerenciador de usuários...');
  const menuIcon = page.locator('div[style*="background-color: rgb(78, 205, 196)"]')
    .filter({ has: page.locator('svg') })
    .first();
  
  await menuIcon.click();
  await page.waitForTimeout(1000);
  
  const usersButton = page.locator('button').filter({ hasText: 'Usuários' }).first();
  await usersButton.click();
  await page.waitForTimeout(2000);
  
  // 3. Criar usuário para teste
  console.log('\n3. Criando usuário para teste...');
  const timestamp = Date.now();
  const userName = `Test Edit ${timestamp}`;
  const userEmail = `testedit${timestamp}@example.com`;
  const userNickname = `testedit${timestamp}`;
  
  await page.getByPlaceholder('Ex: João da Silva').fill(userName);
  await page.getByPlaceholder('Ex: joao@empresa.com').fill(userEmail);
  await page.getByPlaceholder('Ex: joaosilva (será gerado a partir do email se não informado)').fill(userNickname);
  
  // Selecionar role "Editor"
  const editorRole = page.getByText('Editor').first();
  await editorRole.click();
  
  // Clicar em "Criar Usuário"
  await page.getByRole('button', { name: 'Criar Usuário' }).click();
  await page.waitForTimeout(3000);
  
  // 4. Editar usuário
  console.log('\n4. Editando usuário...');
  
  // Encontrar card do usuário
  const userCard = page.locator('div').filter({ has: page.getByText(userName, { exact: true }) }).first();
  const cardHTML = await userCard.innerHTML().catch(() => 'Não foi possível obter HTML');
  console.log('HTML do card (primeiros 500 chars):', cardHTML.substring(0, 500));
  
  // Encontrar botão Editar
  const editButtons = await userCard.locator('button').filter({ hasText: 'Editar' }).all();
  console.log(`Encontrados ${editButtons.length} botões Editar no card`);
  
  if (editButtons.length > 0) {
    console.log('Clicando no primeiro botão Editar...');
    await editButtons[0].click();
    await page.waitForTimeout(2000);
    
    // Verificar formulário
    const formName = await page.getByPlaceholder('Ex: João da Silva').inputValue();
    console.log('Nome no formulário:', formName);
    
    if (formName === userName) {
      console.log('✅ Formulário carregado com dados corretos!');
      
      // Atualizar nome
      const updatedName = `${userName} EDITADO`;
      await page.getByPlaceholder('Ex: João da Silva').fill(updatedName);
      
      // Clicar em "Atualizar Usuário"
      await page.getByRole('button', { name: 'Atualizar Usuário' }).click();
      await page.waitForTimeout(3000);
      
      // Verificar se nome foi atualizado
      const updatedVisible = await page.getByText(updatedName, { exact: true }).isVisible();
      console.log(`Usuário atualizado "${updatedName}" visível?`, updatedVisible);
      
      if (updatedVisible) {
        console.log('✅ Edição bem-sucedida!');
      } else {
        console.log('❌ Usuário atualizado não encontrado');
        // Verificar usuário original ainda existe
        const originalVisible = await page.getByText(userName, { exact: true }).isVisible();
        console.log(`Usuário original "${userName}" ainda visível?`, originalVisible);
      }
    } else {
      console.log(`❌ Formulário carregado com nome errado: "${formName}" em vez de "${userName}"`);
    }
  } else {
    console.log('❌ Nenhum botão Editar encontrado no card');
    // Listar todos os botões no card
    const allButtons = await userCard.locator('button').all();
    console.log(`Total de botões no card: ${allButtons.length}`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent().catch(() => 'Sem texto');
      console.log(`  Botão ${i + 1}: "${text}"`);
    }
  }
  
  await browser.close();
})();
