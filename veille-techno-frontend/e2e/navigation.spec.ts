import { test, expect } from '@playwright/test'

test('opens the board at the root URL', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('Board')
})

test('redirects an unknown URL to the board', async ({ page }) => {
  await page.goto('/nimporte-quoi')
  await expect(page).toHaveURL('/')
  await expect(page.locator('h1')).toHaveText('Board')
})
