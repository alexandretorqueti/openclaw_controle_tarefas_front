import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capturar logs
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Erro') || msg.text().includes('error')) {
      console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
    }
  });
  
  console.log('=== TESTE SIMPLES CRUD USUÁRIOS ===');
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
  
  // 2. Abrir menu
  console.log('\n2. Abrindo menu...');
  const menuIcon = page.locator('div[style*="background-color: rgb(78, 205, 196)"]')
    .filter({ has: page.locator('svg') })
    .first();
  
  await menuIcon.click();
  await page.waitForTimeout(1000);
  
  // 3. Abrir gerenciador de usuários
  console.log('\n3. Abrindo gerenciador de usuários...');
  const usersButton = page.locator('button').filter({ hasText: 'Usuários' }).first();
  await usersButton.click();
  await page.waitForTimeout(2000);
  
  // Verificar se modal abriu
  const modalVisible = await page.getByText('Gerenciar Usuários').isVisible();
  console.log('Modal "Gerenciar Usuários" visível?', modalVisible);
  
  if (!modalVisible) {
    console.log('Modal não abriu. Saindo...');
    await browser.close();
    return;
  }
  
  // 4. Criar usuário
  console.log('\n4. Criando novo usuário...');
  const timestamp = Date.now();
  const userName = `Test User ${timestamp}`;
  const userEmail = `test${timestamp}@example.com`;
  const userNickname = `testuser${timestamp}`;
  
  await page.getByPlaceholder('Ex: João da Silva').fill(userName);
  await page.getByPlaceholder('Ex: joao@empresa.com').fill(userEmail);
  await page.getByPlaceholder('Ex: joaosilva (será gerado a partir do email se não informado)').fill(userNickname);
  
  // Selecionar role "Editor"
  const editorRole = page.getByText('Editor').first();
  await editorRole.click();
  
  // Clicar em "Criar Usuário"
  await page.getByRole('button', { name: 'Criar Usuário' }).click();
  await page.waitForTimeout(2000);
  
  // Verificar se usuário foi criado
  const userVisible = await page.getByText(userName, { exact: true }).isVisible();
  console.log(`Usuário "${userName}" criado e visível?`, userVisible);
  
  if (!userVisible) {
    // Verificar se há mensagem de erro
    const errorText = await page.getByText('Erro', 'error', 'Error', { ignoreCase: true }).first().textContent().catch(() => 'Nenhum erro encontrado');
    console.log('Mensagem de erro:', errorText);
    
    // Tirar screenshot para debug
    await page.screenshot({ path: 'debug-criacao-falhou.png' });
    console.log('Screenshot salvo em debug-criacao-falhou.png');
  } else {
    console.log('\n5. Teste de criação bem-sucedido!');
    // Tirar screenshot
    await page.screenshot({ path: 'debug-criacao-sucesso.png' });
    console.log('Screenshot salvo em debug-criacao-sucesso.png');
  }
  
  await browser.close();
})();
