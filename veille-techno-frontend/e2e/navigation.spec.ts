import { test, expect } from '@playwright/test'

test('opens the board at the root URL when signed in', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('authToken', 'test-jwt'))
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('Board')
})

test('redirects an unknown URL to the board when signed in', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('authToken', 'test-jwt'))
  await page.goto('/nimporte-quoi')
  await expect(page).toHaveURL('/')
  await expect(page.locator('h1')).toHaveText('Board')
})

test('redirects a visitor to login at the root URL', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible()
})
