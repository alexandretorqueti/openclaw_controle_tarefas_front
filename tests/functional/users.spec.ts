import { test, expect, Page } from '@playwright/test';

test.describe('Teste funcional de usuários', () => {
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
    
    // Wait for login to complete - look for menu icon
    const menuIcon = page.locator('div').filter({ has: page.locator('svg') }).first();
    await expect(menuIcon).toBeVisible();
    await page.waitForLoadState('networkidle');
    
    // 2. Open floating menu (hover to open)
    await menuIcon.hover();
    // Wait for menu to appear
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'debug-menu.png' });
    // Configurações está dentro de um h3 no cabeçalho do menu
    await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible({ timeout: 10000 });
    
    // 3. Click on "Usuários" option
    const usersOption = page.getByText('Usuários').first();
    await usersOption.click();
    
    // 4. Verify user management modal opened
    await expect(page.getByRole('heading', { name: 'Gerenciar Usuários' })).toBeVisible();
    
    // 5. Create a new user with unique data
    const timestamp = Date.now();
    const userName = `Test User ${timestamp}`;
    const userEmail = `test${timestamp}@example.com`;
    const userNickname = `testuser${timestamp}`;
    
    await page.getByPlaceholder('Ex: João da Silva').fill(userName);
    await page.getByPlaceholder('Ex: joao@empresa.com').fill(userEmail);
    await page.getByPlaceholder('Ex: joaosilva (será gerado a partir do email se não informado)').fill(userNickname);
    
    // Select "Editor" role
    const editorRole = page.getByText('Editor').first();
    await editorRole.click();
    
    // Click "Criar Usuário"
    await page.getByRole('button', { name: 'Criar Usuário' }).click();
    
    // Wait for creation - look for success (user appears in list)
    await expect(page.getByText(userName)).toBeVisible({ timeout: 10000 });
    
    // 6. Edit the created user
    // Find user card (simplified: just click Edit button next to the user name)
    const userCard = page.locator('div').filter({ has: page.getByText(userName) }).first();
    const editButton = userCard.getByRole('button', { name: 'Editar' });
    await editButton.click();
    
    // Verify form is filled with previous data
    await expect(page.getByPlaceholder('Ex: João da Silva')).toHaveValue(userName);
    
    // Change name
    const updatedName = `${userName} Editado`;
    await page.getByPlaceholder('Ex: João da Silva').fill(updatedName);
    
    // Click "Atualizar Usuário"
    await page.getByRole('button', { name: 'Atualizar Usuário' }).click();
    
    // Wait for update
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });
    
    // 7. Delete the user
    // Find card again
    const editedCard = page.locator('div').filter({ has: page.getByText(updatedName) }).first();
    const deleteButton = editedCard.getByRole('button', { name: 'Excluir' });
    
    // Handle confirmation dialog
    page.once('dialog', dialog => dialog.accept());
    await deleteButton.click();
    
    // Wait for deletion
    await expect(page.getByText(updatedName)).not.toBeVisible({ timeout: 10000 });
    
    // 8. Close modal
    const closeButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await closeButton.click();
    
    // Verify modal closed
    await expect(page.getByRole('heading', { name: 'Gerenciar Usuários' })).not.toBeVisible();
  });
});