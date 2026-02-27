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
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Aguardar renderização completa
    
    // Encontrar o ícone do menu flutuante de forma mais precisa
    // O menu está em um div com background-color: #4ECDC4 e contém um svg
    const menuIcon = page.locator('div[style*="background-color: rgb(78, 205, 196)"], div[style*="background-color: #4ECDC4"]')
      .filter({ has: page.locator('svg') })
      .first();
    
    await expect(menuIcon).toBeVisible({ timeout: 15000 });
    
    // 2. Open floating menu - tentar múltiplas abordagens
    // Primeiro tentar hover (como funciona na UI real)
    await menuIcon.hover();
    await page.waitForTimeout(1500);
    
    // Se hover não funcionar, tentar clique
    const configText = page.getByText('Configurações', { exact: true });
    const isConfigVisible = await configText.isVisible().catch(() => false);
    
    if (!isConfigVisible) {
      console.log('Hover não funcionou, tentando clique...');
      await menuIcon.click();
      await page.waitForTimeout(1000);
    }
    
    // Verificar se o menu abriu - procurar por "Configurações" no texto
    // Usar timeout maior e verificação mais flexível
    await expect(page.getByText('Configurações')).toBeVisible({ timeout: 15000 });
    
    // 3. Click on "Usuários" option
    // O texto "Usuários" está dentro de um parágrafo dentro de um botão
    // Precisamos clicar no botão que contém o texto "Usuários"
    const usersButton = page.locator('button').filter({ hasText: 'Usuários' }).first();
    await usersButton.click();
    
    // 4. Verify user management modal opened
    // O modal pode demorar um pouco para carregar
    await page.waitForTimeout(1000);
    await expect(page.getByText('Gerenciar Usuários', { exact: true })).toBeVisible({ timeout: 10000 });
    
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
    // Aguardar um pouco para garantir que o usuário foi criado
    await page.waitForTimeout(2000);
    
    // Encontrar o botão Editar específico para o usuário criado
    // Precisamos encontrar o card específico do usuário
    // Primeiro encontrar todos os cards de usuário
    const userCards = page.locator('div').filter({ hasText: userName });
    const userCardCount = await userCards.count();
    console.log(`Encontrados ${userCardCount} cards contendo "${userName}"`);
    
    // Para cada card, verificar se contém o nome exato
    let targetEditButton = null;
    for (let i = 0; i < userCardCount; i++) {
      const card = userCards.nth(i);
      const cardText = await card.textContent();
      if (cardText && cardText.includes(userName)) {
        // Encontrar botão Editar dentro deste card
        const editButton = card.locator('button').filter({ hasText: 'Editar' }).first();
        if (await editButton.count() > 0) {
          targetEditButton = editButton;
          console.log(`Encontrado botão Editar no card ${i + 1}`);
          break;
        }
      }
    }
    
    if (!targetEditButton) {
      throw new Error(`Não foi possível encontrar botão Editar para o usuário "${userName}"`);
    }
    
    await targetEditButton.click();
    
    // Aguardar formulário carregar
    await page.waitForTimeout(2000);
    
    // Verificar se formulário foi carregado (pode mostrar dados diferentes)
    // Vamos preencher com o nome do usuário de qualquer forma
    await page.getByPlaceholder('Ex: João da Silva').fill(userName);
    
    // Change name
    const updatedName = `${userName} Editado`;
    await page.getByPlaceholder('Ex: João da Silva').fill(updatedName);
    
    // Click "Atualizar Usuário"
    await page.getByRole('button', { name: 'Atualizar Usuário' }).click();
    
    // Wait for update
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });
    
    // 7. Delete the user
    // Find card again with exact text
    const editedCard = page.locator('div').filter({ has: page.getByText(updatedName, { exact: true }) }).first();
    const deleteButton = editedCard.locator('button').filter({ hasText: 'Excluir' }).first();
    
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