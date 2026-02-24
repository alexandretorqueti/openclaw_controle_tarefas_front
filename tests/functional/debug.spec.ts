import { test, expect } from '@playwright/test';

test('debug menu', async ({ page }) => {
  await page.goto('/');
  const loginTab = page.getByRole('button', { name: 'Login', exact: true });
  await loginTab.click();
  const nicknameInput = page.getByPlaceholder('Digite seu nickname');
  await nicknameInput.fill('alexandre');
  const loginButton = page.getByRole('button', { name: 'Entrar com Nickname' });
  await loginButton.click();
  await page.waitForLoadState('networkidle');
  
  // Get the menu icon
  const menuIcon = page.locator('div').filter({ has: page.locator('svg') }).first();
  await expect(menuIcon).toBeVisible();
  
  // Click on the icon
  await menuIcon.click();
  await page.waitForTimeout(2000);
  
  // Get all HTML of the page
  const html = await page.content();
  console.log('HTML length:', html.length);
  // Look for menu related text - agora procurando pelo heading
  const configHeading = page.getByRole('heading', { name: 'Configurações' });
  if (await configHeading.isVisible()) {
    console.log('Found Configurações heading in menu');
  } else {
    console.log('Configurações heading NOT found');
  }
  
  // Take screenshot
  await page.screenshot({ path: 'debug-full.png', fullPage: true });
});