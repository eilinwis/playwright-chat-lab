import { test, expect } from '@playwright/test'
import { sendMessage } from './helpers'

test.describe('Homework 11: CI, parallelism & best practices', () => {
  test.describe('a test that needs exactly one retry', () => {
    test.describe.configure({ retries: 1 })

    test('fails once, then passes', async ({}, testInfo) => {
      if (testInfo.retry === 0) throw new Error('first attempt fails on purpose')
      expect(testInfo.retry).toBe(1)
    })
  })

  test('searching for a sent message, organized into labeled steps', async ({ page }) => {
    await test.step('send a message from Chat', async () => {
      await page.goto('/')
      await sendMessage(page, 'Ostriches assemble')
    })

    await test.step('go to Search and look for it', async () => {
      await page.getByTestId('nav-tab-search').click()
      await page.getByPlaceholder('Type words from a message…').fill('Ostriches')
    })

    await test.step('assert exactly one result', async () => {
      await expect(page.locator('li.search-results__item')).toHaveCount(1)
    })
  })

  test.describe('independent tests safe to run in parallel', () => {
    test.describe.configure({ mode: 'parallel' })

    test('sends "Bananas are great" and sees only its own message', async ({ page }) => {
      await page.goto('/')
      await sendMessage(page, 'Bananas are great')
      await expect(page.getByTestId('message-user').last()).toHaveText('Bananas are great')
    })

    test('sends "Ostriches assemble" and sees only its own message', async ({ page }) => {
      await page.goto('/')
      await sendMessage(page, 'Ostriches assemble')
      await expect(page.getByTestId('message-user').last()).toHaveText('Ostriches assemble')
    })
  })
})
