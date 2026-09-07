import { test, expect } from '@playwright/test'

test.describe('Homework 11: CI, parallelism & best practices', () => {
  test.describe('a test that needs exactly one retry', () => {
    test.describe.configure({ retries: 1 })

    test('fails once, then passes', async ({}, testInfo) => {

      // eslint-disable-next-line playwright/no-conditional-in-test
      if (testInfo.retry === 0) {
        throw new Error('Simulated flake — only fails on the very first attempt.')
      }

      expect(testInfo.retry).toBe(1)
    })
  })

  test('searching for a sent message, organized into labeled steps', async ({ page }) => {
    await test.step('send a message from Chat', async () => {
      await page.goto('/')
      await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
      await page.getByTestId('chat-input').fill('Ostriches assemble')
      await page.getByTestId('send-button').click()
      await expect(page.getByTestId('message-assistant').last()).toBeVisible()
    })

    await test.step('go to Search and look for it', async () => {
      await page.getByTestId('nav-tab-search').click()
      await page.getByPlaceholder('Type words from a message…').fill('Ostriches')
    })

    await test.step('assert exactly one result', async () => {
      await expect(page.locator('li.search-results__item')).toHaveCount(1)
    })
  })


  test.describe('two independent tests, safe to run at the same time', () => {
    test.describe.configure({ mode: 'parallel' })

    test('one sends its own message and only checks that one', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
      await page.getByTestId('chat-input').fill('Bananas are great')
      await page.getByTestId('send-button').click()

      await expect(page.getByTestId('message-user').last()).toHaveText('Bananas are great')
    })

    test('the other does the same with a different message', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
      await page.getByTestId('chat-input').fill('Ostriches assemble')
      await page.getByTestId('send-button').click()

      await expect(page.getByTestId('message-user').last()).toHaveText('Ostriches assemble')
    })
  })
})
