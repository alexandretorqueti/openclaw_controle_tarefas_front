import { test, expect, Page } from '@playwright/test';

test.describe('Teste funcional de usuários - Versão Final', () => {
  test.setTimeout(120000);

  test('deve realizar login, abrir gerenciador de usuários e executar operações CRUD', async ({ page }) => {
    // 1. Login
    await page.goto('/');
    await expect(page).toHaveTitle('Sistema de Gestão de Tarefas');
    
    const loginTab = page.getByRole('button', { name: 'Login', exact: true });
    await loginTab.click();
    
    const nicknameInput = page.getByPlaceholder('Digite seu nickname');
    await nicknameInput.fill('alexandre');
    
    const loginButton = page.getByRole('button', { name: 'Entrar com Nickname' });
    await loginButton.click();
    
    // Aguardar login completo
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 2. Encontrar e interagir com menu flutuante
    // Menu é div com: width: 40px; height: 40px; background-color: rgb(78, 205, 196)
    const menuIcon = page.locator('div[style*="width: 40px"][style*="height: 40px"][style*="background-color: rgb(78, 205, 196)"]')
      .filter({ has: page.locator('svg') })
      .first();
    
    await expect(menuIcon).toBeVisible({ timeout: 10000 });
    
    // Abrir menu com hover (como na UI real)
    await menuIcon.hover();
    await page.waitForTimeout(2000);
    
    // Verificar se menu abriu
    await expect(page.getByText('Configurações', { exact: true })).toBeVisible({ timeout: 10000 });
    
    // 3. Clicar em "Usuários"
    const usersButton = page.locator('button').filter({ hasText: 'Usuários' }).first();
    await usersButton.click();
    
    // 4. Verificar modal de gerenciamento de usuários
    await page.waitForTimeout(1000);
    await expect(page.getByText('Gerenciar Usuários', { exact: true })).toBeVisible({ timeout: 10000 });
    
    // 5. Criar novo usuário
    const timestamp = Date.now();
    const userName = `Test User ${timestamp}`;
    const userEmail = `test${timestamp}@example.com`;
    const userNickname = `testuser${timestamp}`;
    
    await page.getByPlaceholder('Ex: João da Silva').fill(userName);
    await page.getByPlaceholder('Ex: joao@empresa.com').fill(userEmail);
    await page.getByPlaceholder('Ex: joaosilva (será gerado a partir do email se não informado)').fill(userNickname);
    
    // Selecionar role "Editor"
    const editorRole = page.getByText('Editor', { exact: true }).first();
    await editorRole.click();
    
    // Clicar "Criar Usuário"
    await page.getByRole('button', { name: 'Criar Usuário' }).click();
    
    // Aguardar criação - verificar que nome aparece (pode ser em span ou strong)
    await expect(page.locator('span, strong').filter({ hasText: userName, exact: true }).first()).toBeVisible({ timeout: 10000 });
    
    // 6. Editar usuário criado
    await page.waitForTimeout(2000);
    
    // Encontrar card do usuário - nome está em span com fontWeight: 600
    const userNameElement = page.locator('span').filter({ hasText: userName, exact: true }).first();
    await expect(userNameElement).toBeVisible({ timeout: 5000 });
    
    // Encontrar card pai (contém padding e border)
    const userCard = userNameElement.locator('xpath=..').locator('xpath=..').locator('xpath=..');
    
    // Encontrar botão Editar
    const editButton = userCard.locator('button').filter({ hasText: 'Editar' }).first();
    await editButton.click();
    
    // Aguardar formulário
    await page.waitForTimeout(2000);
    
    // Alterar nome
    const updatedName = `${userName} Editado`;
    await page.getByPlaceholder('Ex: João da Silva').fill(updatedName);
    
    // Atualizar usuário
    await page.getByRole('button', { name: 'Atualizar Usuário' }).click();
    
    // Aguardar atualização - usar locator que não falha com múltiplos elementos
    await expect(page.locator('*').filter({ hasText: updatedName, exact: true }).first()).toBeVisible({ timeout: 10000 });
    
    // 7. Excluir usuário
    await page.waitForTimeout(2000);
    
    // Encontrar elemento com nome atualizado
    const updatedNameElement = page.locator('*').filter({ hasText: updatedName, exact: true }).first();
    await expect(updatedNameElement).toBeVisible({ timeout: 5000 });
    
    // Encontrar card pai
    const updatedUserCard = updatedNameElement.locator('xpath=..').locator('xpath=..').locator('xpath=..');
    
    // Encontrar botão Excluir
    const deleteButton = updatedUserCard.locator('button').filter({ hasText: 'Excluir' }).first();
    
    // Confirmar diálogo
    page.once('dialog', dialog => dialog.accept());
    await deleteButton.click();
    
    // Aguardar exclusão
    await expect(page.locator('*').filter({ hasText: updatedName, exact: true })).not.toBeVisible({ timeout: 10000 });
    
    // 8. Fechar modal
    const closeButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await closeButton.click();
    
    // Verificar modal fechado
    await expect(page.getByText('Gerenciar Usuários', { exact: true })).not.toBeVisible({ timeout: 5000 });
    
    console.log('✅ Teste de usuários CRUD concluído com sucesso!');
  });
});