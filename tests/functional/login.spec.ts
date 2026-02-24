import { test, expect } from '@playwright/test';

test('login com nickname', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Sistema de Gestão de Tarefas');
  // Take screenshot
  await page.screenshot({ path: 'screenshot-home.png' });
  
  // Click Login tab
  const loginTab = page.getByRole('button', { name: 'Login', exact: true });
  await loginTab.click();
  await page.screenshot({ path: 'screenshot-login-tab.png' });
  
  // Fill nickname
  const nicknameInput = page.getByPlaceholder('Digite seu nickname');
  await nicknameInput.fill('alexandre');
  await page.screenshot({ path: 'screenshot-filled.png' });
  
  // Click login button
  const loginButton = page.getByRole('button', { name: 'Entrar com Nickname' });
  await loginButton.click();
  
  // Wait for navigation
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshot-after-login.png' });
  
  // Check for menu icon
  const menuIcon = page.locator('div').filter({ has: page.locator('svg') }).first();
  await expect(menuIcon).toBeVisible();
});