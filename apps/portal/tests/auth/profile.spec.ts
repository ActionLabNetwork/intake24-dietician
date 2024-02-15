import { test, expect } from '@playwright/test'

test('should update profile successfully', async ({ page }) => {
  await page.goto('http://localhost:5173/auth/login')

  // Login
  await page.getByPlaceholder('Enter your email address').click()
  await page.getByPlaceholder('Enter your email address').fill('diet@test.com')
  await page.getByPlaceholder('Enter your email address').press('Tab')
  await page.getByPlaceholder('Enter your password').fill('password')
  await page.getByRole('button', { name: 'Log in' }).click()

  const updateButton = page
    .locator('div')
    .filter({ hasText: /^Update profile information$/ })
    .getByRole('button')

  // Update first name, test top button
  await expect(updateButton).toBeDisabled()
  await page.locator('#input-28').click()
  await page.locator('#input-28').fill('Johnny')
  await updateButton.click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(updateButton).toBeDisabled()

  // Update first name, test bottom button
  await expect(page.locator('#input-28')).toHaveValue('Johnny')
  await page.locator('#input-28').click()
  await page.locator('#input-28').fill('John')
  await updateButton.click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.locator('#input-28')).toHaveValue('John')
  await expect(updateButton).toBeDisabled()
})
