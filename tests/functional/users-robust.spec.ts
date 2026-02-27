import { test, expect, Page } from '@playwright/test';

test.describe('Teste funcional de usuários - Versão Robusta', () => {
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
    
    // Aguardar login
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    console.log('✅ Login concluído');
    
    // 2. Menu flutuante
    const menuIcon = page.locator('div[style*="width: 40px"][style*="height: 40px"][style*="background-color: rgb(78, 205, 196)"]')
      .filter({ has: page.locator('svg') })
      .first();
    
    await expect(menuIcon).toBeVisible({ timeout: 10000 });
    console.log('✅ Ícone do menu encontrado');
    
    // Hover para abrir menu
    await menuIcon.hover();
    await page.waitForTimeout(2000);
    console.log('✅ Hover no menu');
    
    // Verificar menu aberto
    await expect(page.getByText('Configurações', { exact: true })).toBeVisible({ timeout: 10000 });
    console.log('✅ Menu aberto - "Configurações" visível');
    
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
    
    // Selecionar role
    const editorRole = page.getByText('Editor', { exact: true }).first();
    await editorRole.click();
    
    await page.getByRole('button', { name: 'Criar Usuário' }).click();
    console.log('✅ Botão "Criar Usuário" clicado');
    
    // Aguardar criação - verificar de forma flexível
    const userNameLocator = page.locator('div').filter({ hasText: userName }).first();
    await expect(userNameLocator).toBeVisible({ timeout: 10000 });
    console.log(`✅ Usuário "${userName}" criado e visível`);
    
    // 6. Editar usuário
    await page.waitForTimeout(2000);
    
    // Estratégia: encontrar todos os cards de usuário e selecionar o que tem nosso usuário
    const userCards = page.locator('div').filter({ hasText: userName });
    const userCardCount = await userCards.count();
    console.log(`🔍 Encontrados ${userCardCount} cards com "${userName}"`);
    
    if (userCardCount === 0) {
      throw new Error(`Nenhum card encontrado para usuário "${userName}"`);
    }
    
    // Usar o primeiro card (deve ser o correto)
    const targetUserCard = userCards.first();
    
    // Encontrar botão Editar dentro deste card
    const editButton = targetUserCard.locator('button').filter({ hasText: 'Editar' }).first();
    await expect(editButton).toBeVisible({ timeout: 5000 });
    await editButton.click();
    console.log('✅ Botão "Editar" clicado');
    
    // Aguardar formulário
    await page.waitForTimeout(2000);
    
    // Alterar nome
    const updatedName = `${userName} Editado`;
    await page.getByPlaceholder('Ex: João da Silva').fill(updatedName);
    console.log(`✏️ Nome alterado para: ${updatedName}`);
    
    // Atualizar
    await page.getByRole('button', { name: 'Atualizar Usuário' }).click();
    console.log('✅ Botão "Atualizar Usuário" clicado');
    
    // Aguardar atualização - procurar novo nome
    await page.waitForTimeout(2000);
    const updatedUserLocator = page.locator('div').filter({ hasText: updatedName }).first();
    await expect(updatedUserLocator).toBeVisible({ timeout: 10000 });
    console.log(`✅ Usuário atualizado para "${updatedName}"`);
    
    // 7. Excluir usuário
    await page.waitForTimeout(2000);
    
    // Encontrar card atualizado
    const updatedUserCards = page.locator('div').filter({ hasText: updatedName });
    const updatedCardCount = await updatedUserCards.count();
    
    if (updatedCardCount === 0) {
      throw new Error(`Nenhum card encontrado para usuário atualizado "${updatedName}"`);
    }
    
    const targetUpdatedCard = updatedUserCards.first();
    
    // Encontrar botão Excluir
    const deleteButton = targetUpdatedCard.locator('button').filter({ hasText: 'Excluir' }).first();
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    
    // Confirmar diálogo
    page.once('dialog', dialog => {
      console.log('✅ Diálogo de confirmação detectado - aceitando');
      dialog.accept();
    });
    
    await deleteButton.click();
    console.log('✅ Botão "Excluir" clicado');
    
    // Aguardar exclusão
    await page.waitForTimeout(2000);
    await expect(updatedUserLocator).not.toBeVisible({ timeout: 10000 });
    console.log(`✅ Usuário "${updatedName}" excluído`);
    
    // 8. Fechar modal
    const closeButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    if (await closeButton.count() > 0) {
      await closeButton.click();
      console.log('✅ Modal fechado');
    }
    
    // Verificar modal fechado
    await expect(page.getByText('Gerenciar Usuários', { exact: true })).not.toBeVisible({ timeout: 5000 });
    
    console.log('🎉 TESTE DE USUÁRIOS CRUD CONCLUÍDO COM SUCESSO!');
  });
});