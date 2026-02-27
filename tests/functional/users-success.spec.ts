import { test, expect, Page } from '@playwright/test';

test.describe('Teste funcional de usuários - Sucesso', () => {
  test.setTimeout(120000);

  test('deve realizar login, abrir gerenciador de usuários e executar operações CRUD', async ({ page }) => {
    console.log('=== INICIANDO TESTE DE USUÁRIOS ===');
    
    // 1. Login
    await page.goto('/');
    await expect(page).toHaveTitle('Sistema de Gestão de Tarefas');
    console.log('✅ Página carregada');
    
    const loginTab = page.getByRole('button', { name: 'Login', exact: true });
    await loginTab.click();
    console.log('✅ Tab Login clicada');
    
    const nicknameInput = page.getByPlaceholder('Digite seu nickname');
    await nicknameInput.fill('alexandre');
    console.log('✅ Nickname preenchido');
    
    const loginButton = page.getByRole('button', { name: 'Entrar com Nickname' });
    await loginButton.click();
    console.log('✅ Botão login clicado');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    console.log('✅ Login concluído');
    
    // 2. Menu flutuante
    const menuIcon = page.locator('div[style*="width: 40px"][style*="height: 40px"][style*="background-color: rgb(78, 205, 196)"]')
      .filter({ has: page.locator('svg') })
      .first();
    
    await expect(menuIcon).toBeVisible({ timeout: 10000 });
    console.log('✅ Ícone do menu encontrado');
    
    await menuIcon.hover();
    await page.waitForTimeout(2000);
    console.log('✅ Hover no menu');
    
    await expect(page.getByText('Configurações', { exact: true })).toBeVisible({ timeout: 10000 });
    console.log('✅ Menu aberto');
    
    // 3. Clicar em "Usuários"
    const usersButton = page.locator('button').filter({ hasText: 'Usuários' }).first();
    await expect(usersButton).toBeVisible({ timeout: 5000 });
    await usersButton.click();
    console.log('✅ Botão "Usuários" clicado');
    
    // 4. Verificar modal
    await page.waitForTimeout(1000);
    await expect(page.getByText('Gerenciar Usuários', { exact: true })).toBeVisible({ timeout: 10000 });
    console.log('✅ Modal "Gerenciar Usuários" aberto');
    
    // 5. Criar usuário
    const timestamp = Date.now();
    const userName = `Test User ${timestamp}`;
    const userEmail = `test${timestamp}@example.com`;
    const userNickname = `testuser${timestamp}`;
    
    console.log(`📝 Criando usuário: ${userName}`);
    
    await page.getByPlaceholder('Ex: João da Silva').fill(userName);
    await page.getByPlaceholder('Ex: joao@empresa.com').fill(userEmail);
    await page.getByPlaceholder('Ex: joaosilva (será gerado a partir do email se não informado)').fill(userNickname);
    
    const editorRole = page.getByText('Editor', { exact: true }).first();
    await editorRole.click();
    
    await page.getByRole('button', { name: 'Criar Usuário' }).click();
    console.log('✅ Botão "Criar Usuário" clicado');
    
    // Aguardar criação - usar abordagem mais robusta
    await page.waitForTimeout(2000);
    const userCardLocator = page.locator('div').filter({ 
      has: page.locator(`text="${userName}"`),
      has: page.locator('button:has-text("Editar")')
    });
    
    await expect(userCardLocator.first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ Usuário "${userName}" criado`);
    
    // 6. Editar usuário
    await page.waitForTimeout(2000);
    
    // Encontrar botão Editar dentro do card
    const editButton = userCardLocator.locator('button').filter({ hasText: 'Editar' }).first();
    await editButton.click();
    console.log('✅ Botão "Editar" clicado');
    
    await page.waitForTimeout(2000);
    
    // Alterar nome
    const updatedName = `${userName} Editado`;
    await page.getByPlaceholder('Ex: João da Silva').fill(updatedName);
    console.log(`✏️ Nome alterado para: ${updatedName}`);
    
    await page.getByRole('button', { name: 'Atualizar Usuário' }).click();
    console.log('✅ Botão "Atualizar Usuário" clicado');
    
    // Aguardar atualização
    await page.waitForTimeout(3000);
    const updatedCardLocator = page.locator('div').filter({ 
      has: page.locator(`text="${updatedName}"`),
      has: page.locator('button:has-text("Editar")')
    });
    
    await expect(updatedCardLocator.first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ Usuário atualizado para "${updatedName}"`);
    
    // 7. Excluir usuário
    await page.waitForTimeout(2000);
    
    // Contar quantos cards temos antes da exclusão
    const cardCountBefore = await updatedCardLocator.count();
    console.log(`📊 Cards com nome "${updatedName}" antes: ${cardCountBefore}`);
    
    // Botão Excluir
    const deleteButton = updatedCardLocator.locator('button').filter({ hasText: 'Excluir' }).first();
    
    // Diálogo
    page.once('dialog', dialog => {
      console.log('✅ Diálogo de confirmação - aceitando');
      dialog.accept();
    });
    
    await deleteButton.click();
    console.log('✅ Botão "Excluir" clicado');
    
    // Aguardar exclusão - verificar que o contador vai para 0
    await page.waitForTimeout(3000);
    
    // Tentativa 1: verificar que não há mais cards com esse nome E botão Editar
    const maxAttempts = 10;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const currentCount = await updatedCardLocator.count();
      console.log(`🔄 Tentativa ${attempt}/${maxAttempts}: ${currentCount} cards com "${updatedName}"`);
      
      if (currentCount === 0) {
        console.log(`✅ Usuário "${updatedName}" excluído (verificado por contagem)`);
        break;
      }
      
      if (attempt === maxAttempts) {
        console.log(`❌ Falha: ainda há ${currentCount} cards após exclusão`);
        // Tirar screenshot para debug
        await page.screenshot({ path: `debug-deletion-failure-${timestamp}.png` });
        throw new Error(`Falha na exclusão: ainda há ${currentCount} cards com nome "${updatedName}"`);
      }
      
      await page.waitForTimeout(1000);
    }
    
    // Tentativa 2: verificar que o texto não aparece em lugar nenhum (opcional)
    const anyText = page.locator(`text="${updatedName}"`);
    const textCount = await anyText.count();
    console.log(`📊 Ocorrências do texto "${updatedName}" após exclusão: ${textCount}`);
    
    // 8. Fechar modal
    const closeButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    if (await closeButton.count() > 0) {
      await closeButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Modal fechado');
    }
    
    // Verificar modal fechado
    await expect(page.getByText('Gerenciar Usuários', { exact: true })).not.toBeVisible({ timeout: 5000 });
    
    console.log('🎉 TESTE DE USUÁRIOS CRUD CONCLUÍDO COM SUCESSO!');
    return true;
  });
});