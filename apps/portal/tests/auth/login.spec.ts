import { test, expect } from '@playwright/test'

test('should login with valid credentials', async ({ page }) => {
  await page.goto('http://localhost:5173/auth/login')

  await page.getByPlaceholder('Enter your email address').click()
  await page.getByPlaceholder('Enter your email address').fill('diet@test.com')

  await page.getByPlaceholder('Enter your password').click()
  await page.getByPlaceholder('Enter your password').fill('password')

  await page.getByRole('button', { name: 'Log in' }).click()

  await expect(
    page.getByText('Your personal details', { exact: true }),
  ).toBeVisible()
})

test('should show error messages', async ({ page }) => {
  await page.goto('http://localhost:5173/auth/login')

  await page.getByPlaceholder('Enter your email address').click()
  await page.getByPlaceholder('Enter your email address').fill('diet')
  await expect(page.getByText('Invalid email')).toBeVisible()

  await page.getByPlaceholder('Enter your password').click()
  await page.getByPlaceholder('Enter your password').fill('pass')

  await expect(page.getByText('Password must be at least 8')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Log in' })).toBeDisabled()
})

test('should not login with invalid credentials', async ({ page }) => {
  await page.goto('http://localhost:5173/auth/login')

  await page.getByPlaceholder('Enter your email address').click()
  await page.getByPlaceholder('Enter your email address').fill('diet@test.com')

  await page.getByPlaceholder('Enter your password').click()
  await page.getByPlaceholder('Enter your password').fill('pppppppp')

  await page.getByRole('button', { name: 'Log in' }).click()

  await expect(page.getByRole('alert').first()).toBeVisible()
})

test('should show/hide password toggle', async ({ page }) => {
  await page.goto('http://localhost:5173/auth/login')

  await page.getByPlaceholder('Enter your password').click()
  await page.getByPlaceholder('Enter your password').fill('password')
  await expect(page.getByPlaceholder('Enter your password')).toHaveAttribute(
    'type',
    'password',
  )
  await page.getByLabel('appended action').click()

  await expect(page.getByPlaceholder('Enter your password')).toHaveAttribute(
    'type',
    'text',
  )
})
