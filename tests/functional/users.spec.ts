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
    
    // 2. Verificar se o header da aplicação carregou (indica login bem-sucedido)
    await expect(page.getByRole('heading', { name: 'Sistema de Gestão', exact: true })).toBeVisible({ timeout: 15000 });
    
    // 3. Encontrar o ícone do menu flutuante - usar seletor preciso baseado no debug
    const menuIcon = page.locator('div[style*="width: 40px"][style*="height: 40px"][style*="background-color: rgb(78, 205, 196)"]')
      .filter({ has: page.locator('svg') })
      .first();
    
    await expect(menuIcon).toBeVisible({ timeout: 10000 });
    
    // 4. Open floating menu - clique direto
    await menuIcon.click();
    await page.waitForTimeout(1000);
    
    // 5. Verificar se o menu abriu
    await expect(page.getByText('Configurações', { exact: true })).toBeVisible({ timeout: 10000 });
    
    // 6. Click on "Usuários" option
    const usersButton = page.locator('button').filter({ hasText: 'Usuários' }).first();
    await usersButton.click();
    
    // 7. Verify user management modal opened
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
    
    // Encontrar o card do usuário criado e o botão Editar
    // Card de usuário tem estrutura específica com botões Editar/Excluir
    const userCard = page.locator('div').filter({ 
      has: page.locator('span', { hasText: userName, exact: true }),
      has: page.locator('button', { hasText: 'Editar' })
    }).first();
    
    await expect(userCard).toBeVisible({ timeout: 5000 });
    
    // Encontrar botão Editar dentro do card
    const editButton = userCard.locator('button').filter({ hasText: 'Editar' }).first();
    await editButton.click();
    
    // Aguardar formulário carregar - esperar o botão "Atualizar Usuário" aparecer
    await expect(page.getByRole('button', { name: 'Atualizar Usuário' })).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Preencher com novo nome
    const updatedName = `${userName} Editado`;
    await page.getByPlaceholder('Ex: João da Silva').fill(updatedName);
    
    // Click "Atualizar Usuário"
    await page.getByRole('button', { name: 'Atualizar Usuário' }).click();
    
    // Aguardar atualização - esperar o formulário fechar (botão "Atualizar Usuário" desaparecer)
    await expect(page.getByRole('button', { name: 'Atualizar Usuário' })).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    // DEBUG: verificar spans
    const allSpans = await page.locator('span').allTextContents();
    const testUserSpans = allSpans.filter(t => t.includes('Test User'));
    console.log('Spans com "Test User":', testUserSpans);
    
    // Wait for update - verificar que o nome atualizado aparece no card
    // Encontrar o span com o nome atualizado, subir até o card e localizar botão Excluir
    const nameSpan = page.locator('span', { hasText: updatedName, exact: true }).first();
    await expect(nameSpan).toBeVisible({ timeout: 10000 });
    
    // Subir até o card (um div que contém botões Editar/Excluir)
    // Tentar subir até encontrar um div que contenha botão Excluir
    let card = nameSpan.locator('xpath=./ancestor::div[1]');
    let attempt = 0;
    while (attempt < 5) {
      const hasDeleteButton = await card.locator('button', { hasText: 'Excluir' }).count();
      if (hasDeleteButton > 0) {
        console.log(`Card encontrado após ${attempt} níveis`);
        break;
      }
      card = card.locator('xpath=./ancestor::div[1]');
      attempt++;
    }
    
    // Verificar se encontrou o card com botão Excluir
    const hasDelete = await card.locator('button', { hasText: 'Excluir' }).count();
    if (hasDelete === 0) {
      throw new Error(`Não foi possível encontrar card com botão Excluir para o usuário "${updatedName}"`);
    }
    
    // Encontrar botão Excluir dentro do card
    const deleteButton = card.locator('button', { hasText: 'Excluir' }).first();
    
    // Registrar handler para diálogo de confirmação ANTES de clicar
    const dialogPromise = new Promise<void>(resolve => {
      page.once('dialog', dialog => {
        console.log('Diálogo de confirmação detectado:', dialog.message());
        dialog.accept();
        resolve();
      });
    });
    
    // Clicar no botão Excluir
    await deleteButton.click();
    
    // Aguardar diálogo e aceitar
    await dialogPromise;
    await page.waitForTimeout(1000);
    
    // Wait for deletion - verificar que o usuário foi removido
    // Esperar que o nome do usuário não esteja mais visível (pode haver múltiplos spans, mas devem desaparecer)
    await expect(page.locator('span', { hasText: updatedName, exact: true })).not.toBeVisible({ timeout: 10000 });
    
    // 8. Close modal
    // Encontrar botão de fechar (X) no modal - pode ser um botão com ícone de X
    // Procurar por botão que contém SVG e está próximo do título
    const closeButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await closeButton.click();
    
    // Verify modal closed
    await expect(page.getByRole('heading', { name: 'Gerenciar Usuários' })).not.toBeVisible();
  });
});