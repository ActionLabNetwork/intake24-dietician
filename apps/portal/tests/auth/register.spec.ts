import { test, expect } from '@playwright/test'

test('should register successfully', async ({ page }) => {
  const generatedEmail = `test-${Math.floor(Math.random() * 100000)}@test.com`

  await page.goto('http://localhost:5173/auth/login')
  await page.getByRole('link', { name: 'Create account' }).click()
  await page.getByPlaceholder('Type in your email address').click()
  await page.getByPlaceholder('Type in your email address').fill(generatedEmail)
  await page.getByPlaceholder('Enter your password').click()
  await page.getByPlaceholder('Enter your password').fill('password')
  await page.getByPlaceholder('********').click()
  await page.getByPlaceholder('********').fill('password')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(
    page.getByRole('heading', { name: "Let's get you started" }),
  ).toBeVisible()
  await page.locator('#input-17').click()
  await page.locator('#input-17').fill('First name')
  await page.locator('#input-19').click()
  await page.locator('#input-19').fill('Middle name')
  await page.locator('#input-21').click()
  await page.locator('#input-21').fill('Last name')
  await expect(page.locator('#input-23')).toHaveValue(generatedEmail)
  await page.locator('#input-28').click()
  await page.locator('#input-28').fill('0452611111')
  await page.locator('#input-33').click()
  await page.locator('#input-33').fill('0452611111')
  await page
    .getByLabel('Write something about yourself', { exact: true })
    .click()
  await page
    .getByLabel('Write something about yourself', { exact: true })
    .fill('Short bio about myself')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.waitForURL('**/my-profile')
  await expect(
    page.getByRole('heading', { name: 'Your account information' }),
  ).toBeVisible()
})
