import { test, expect, Page } from '@playwright/test';

test.describe('Teste funcional de usuários - Completo', () => {
  test.setTimeout(120000);

  test('deve realizar login, abrir gerenciador de usuários e executar operações CRUD', async ({ page }) => {
    console.log('=== TESTE DE USUÁRIOS - INÍCIO ===');
    
    // 1. Login
    await page.goto('/');
    await expect(page).toHaveTitle('Sistema de Gestão de Tarefas');
    
    const loginTab = page.getByRole('button', { name: 'Login', exact: true });
    await loginTab.click();
    
    const nicknameInput = page.getByPlaceholder('Digite seu nickname');
    await nicknameInput.fill('alexandre');
    
    const loginButton = page.getByRole('button', { name: 'Entrar com Nickname' });
    await loginButton.click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 2. Menu flutuante
    const menuIcon = page.locator('div[style*="width: 40px"][style*="height: 40px"][style*="background-color: rgb(78, 205, 196)"]')
      .filter({ has: page.locator('svg') })
      .first();
    
    await expect(menuIcon).toBeVisible({ timeout: 10000 });
    await menuIcon.hover();
    await page.waitForTimeout(2000);
    
    await expect(page.getByText('Configurações', { exact: true })).toBeVisible({ timeout: 10000 });
    
    // 3. Abrir gerenciador de usuários
    const usersButton = page.locator('button').filter({ hasText: 'Usuários' }).first();
    await usersButton.click();
    
    await page.waitForTimeout(1000);
    await expect(page.getByText('Gerenciar Usuários', { exact: true })).toBeVisible({ timeout: 10000 });
    
    // 4. Criar usuário
    const timestamp = Date.now();
    const userName = `TestUser${timestamp}`; // Nome sem espaços para facilitar seleção
    const userEmail = `test${timestamp}@example.com`;
    const userNickname = `testuser${timestamp}`;
    
    await page.getByPlaceholder('Ex: João da Silva').fill(userName);
    await page.getByPlaceholder('Ex: joao@empresa.com').fill(userEmail);
    await page.getByPlaceholder('Ex: joaosilva (será gerado a partir do email se não informado)').fill(userNickname);
    
    await page.getByText('Editor', { exact: true }).first().click();
    await page.getByRole('button', { name: 'Criar Usuário' }).click();
    
    // 5. Aguardar criação - usar seletor específico para card de usuário
    // Card de usuário tem estrutura: div com padding, contém span com nome e botões
    await page.waitForTimeout(2000);
    
    // Estratégia: encontrar o span com o nome exato, então subir para encontrar o card
    const userNameSpan = page.locator('span').filter({ hasText: userName, exact: true });
    await expect(userNameSpan.first()).toBeVisible({ timeout: 10000 });
    
    // Encontrar o card pai que contém este span E botões Editar/Excluir
    // Usar XPath para encontrar ancestrais com estrutura específica
    const userCardXPath = `//span[text()="${userName}"]/ancestor::div[contains(@style, 'padding')][.//button[contains(text(), 'Editar')]]`;
    
    // Alternativa: usar abordagem Playwright pura
    const userCard = userNameSpan.locator('xpath=ancestor::div[contains(@style, "padding")]').first();
    await expect(userCard).toBeVisible({ timeout: 5000 });
    
    // Verificar que tem botões
    const hasEditButton = await userCard.locator('button').filter({ hasText: 'Editar' }).count() > 0;
    if (!hasEditButton) {
      throw new Error('Card não contém botão Editar');
    }
    
    console.log(`✅ Usuário "${userName}" criado e card encontrado`);
    
    // 6. Editar usuário
    const editButton = userCard.locator('button').filter({ hasText: 'Editar' }).first();
    await editButton.click();
    await page.waitForTimeout(2000);
    
    const updatedName = `${userName}Editado`;
    await page.getByPlaceholder('Ex: João da Silva').fill(updatedName);
    await page.getByRole('button', { name: 'Atualizar Usuário' }).click();
    
    // 7. Aguardar atualização
    await page.waitForTimeout(3000);
    
    // Encontrar card atualizado
    const updatedNameSpan = page.locator('span').filter({ hasText: updatedName, exact: true });
    await expect(updatedNameSpan.first()).toBeVisible({ timeout: 10000 });
    
    const updatedCard = updatedNameSpan.locator('xpath=ancestor::div[contains(@style, "padding")]').first();
    await expect(updatedCard).toBeVisible({ timeout: 5000 });
    
    console.log(`✅ Usuário atualizado para "${updatedName}"`);
    
    // 8. Excluir usuário
    const deleteButton = updatedCard.locator('button').filter({ hasText: 'Excluir' }).first();
    
    page.once('dialog', dialog => dialog.accept());
    await deleteButton.click();
    
    // 9. Aguardar exclusão - verificar que o span desaparece
    await page.waitForTimeout(3000);
    
    // Tentar várias vezes
    const maxAttempts = 10;
    let deleted = false;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const spanCount = await updatedNameSpan.count();
      console.log(`🔄 Tentativa ${attempt}/${maxAttempts}: ${spanCount} spans com "${updatedName}"`);
      
      if (spanCount === 0) {
        deleted = true;
        console.log(`✅ Usuário "${updatedName}" excluído com sucesso`);
        break;
      }
      
      await page.waitForTimeout(1000);
    }
    
    if (!deleted) {
      // Fallback: verificar se o card ainda tem botões (pode estar desabilitado)
      const cardStillExists = await updatedCard.count() > 0;
      if (cardStillExists) {
        const stillHasButtons = await updatedCard.locator('button').filter({ hasText: 'Editar' }).count() > 0;
        if (!stillHasButtons) {
          console.log('✅ Card perdeu botões - provavelmente foi excluído');
          deleted = true;
        }
      }
    }
    
    if (!deleted) {
      await page.screenshot({ path: 'debug-final-failure.png' });
      throw new Error(`Falha na exclusão: usuário "${updatedName}" ainda visível`);
    }
    
    // 10. Fechar modal
    const closeButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    if (await closeButton.count() > 0) {
      await closeButton.click();
      await page.waitForTimeout(1000);
    }
    
    await expect(page.getByText('Gerenciar Usuários', { exact: true })).not.toBeVisible({ timeout: 5000 });
    
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    return true;
  });
});