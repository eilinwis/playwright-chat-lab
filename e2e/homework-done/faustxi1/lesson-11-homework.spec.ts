import { test, expect } from '@playwright/test'

test.describe('retry', () => {
  test.describe.configure({ retries: 1 })

  test('fails once, then passes', async ({}, testInfo) => {
    expect(testInfo.retry, 'first attempt fails on purpose').toBe(1)
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

test.describe('parallel', () => {
  test.describe.configure({ mode: 'parallel' })
  for (const text of ['Bananas are great', 'Ostriches assemble']) {
    test(`sends "${text}" independently`, async ({ page }) => {
      await page.goto('/')
      await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
      await page.getByTestId('chat-input').fill(text)
      await page.getByTestId('send-button').click()
      await expect(page.getByTestId('message-user').last()).toHaveText(text)
    })
  }
})
