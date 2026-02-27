import { test, expect, Page } from '@playwright/test';

test.describe('Teste funcional de usuários - Versão Corrigida', () => {
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
    
    // 2. Encontrar menu flutuante - baseado no debug, é o div com estilo específico
    // Buscar div com: width: 40px; height: 40px; background-color: rgb(78, 205, 196)
    const menuIcon = page.locator('div[style*="width: 40px"][style*="height: 40px"][style*="background-color: rgb(78, 205, 196)"]')
      .filter({ has: page.locator('svg') })
      .first();
    
    await expect(menuIcon).toBeVisible({ timeout: 10000 });
    
    // 3. Abrir menu flutuante - usar hover conforme implementação real
    await menuIcon.hover();
    await page.waitForTimeout(2000);
    
    // Verificar se menu abriu - "Configurações" deve estar visível
    await expect(page.getByText('Configurações', { exact: true })).toBeVisible({ timeout: 10000 });
    
    // 4. Clicar em "Usuários" - pode ser um botão ou elemento clicável
    // Primeiro tentar encontrar botão com texto "Usuários"
    const usersButton = page.locator('button, [role="button"], div[style*="cursor: pointer"]')
      .filter({ hasText: 'Usuários' })
      .first();
    
    await expect(usersButton).toBeVisible({ timeout: 5000 });
    await usersButton.click();
    
    // 5. Verificar se modal de gerenciamento de usuários abriu
    await page.waitForTimeout(1000);
    await expect(page.getByText('Gerenciar Usuários', { exact: true })).toBeVisible({ timeout: 10000 });
    
    // 6. Criar um novo usuário com dados únicos
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
    
    // Aguardar criação - usuário deve aparecer na lista
    await expect(page.getByText(userName, { exact: true })).toBeVisible({ timeout: 10000 });
    
    // 7. Editar usuário criado
    await page.waitForTimeout(2000);
    
    // Encontrar o card do usuário - usar seletor mais específico
    // O nome do usuário está em um <span> com fontWeight: 600
    const userSpan = page.locator('span').filter({ hasText: userName, exact: true }).first();
    await expect(userSpan).toBeVisible({ timeout: 5000 });
    
    // Encontrar o card pai que contém o span e botões
    const userCard = userSpan.locator('xpath=ancestor::div[contains(@style, "padding")]').first();
    
    // Encontrar botão Editar dentro do card
    const editButton = userCard.locator('button').filter({ hasText: 'Editar' }).first();
    await editButton.click();
    
    // Aguardar formulário carregar
    await page.waitForTimeout(2000);
    
    // Preencher novo nome
    const updatedName = `${userName} Editado`;
    await page.getByPlaceholder('Ex: João da Silva').fill(updatedName);
    
    // Clicar "Atualizar Usuário"
    await page.getByRole('button', { name: 'Atualizar Usuário' }).click();
    
    // Aguardar atualização
    await expect(page.getByText(updatedName, { exact: true })).toBeVisible({ timeout: 10000 });
    
    // 8. Excluir usuário
    await page.waitForTimeout(2000);
    
    // Encontrar card do usuário atualizado
    const updatedUserSpan = page.locator('span').filter({ hasText: updatedName, exact: true }).first();
    const updatedUserCard = updatedUserSpan.locator('xpath=ancestor::div[contains(@style, "padding")]').first();
    
    // Encontrar botão Excluir
    const deleteButton = updatedUserCard.locator('button').filter({ hasText: 'Excluir' }).first();
    
    // Lidar com diálogo de confirmação
    page.once('dialog', dialog => dialog.accept());
    await deleteButton.click();
    
    // Aguardar exclusão
    await expect(page.getByText(updatedName, { exact: true })).not.toBeVisible({ timeout: 10000 });
    
    // 9. Fechar modal
    const closeButton = page.getByRole('button').filter({ has: page.locator('svg[data-icon="times"]') }).first();
    if (await closeButton.count() > 0) {
      await closeButton.click();
    } else {
      // Alternativa: botão com ícone X
      const xButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      await xButton.click();
    }
    
    // Verificar se modal fechou
    await expect(page.getByRole('heading', { name: 'Gerenciar Usuários' })).not.toBeVisible({ timeout: 5000 });
  });
});