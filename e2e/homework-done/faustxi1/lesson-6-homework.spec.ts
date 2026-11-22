import { test as base, expect } from '@playwright/test'

const test = base.extend<{ sendMessage: (text: string) => Promise<void> }>({
  sendMessage: async ({ page }, use) => {
    await use(async (text) => {
      await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
      await page.getByTestId('chat-input').fill(text)
      await page.getByTestId('send-button').click()
      await expect(page.getByTestId('message-assistant').last()).toBeVisible()
    })
  },
})

test.describe('Homework 6: Hooks & fixtures', () => {
  test.beforeEach(async ({ page, sendMessage }) => {
    await page.goto('/')
    await sendMessage('Spaceships are neat')
    await sendMessage('Historians unite')
    await page.getByTestId('nav-tab-search').click()
    await expect(page).toHaveURL(/\/search$/)
  })

  test('searching finds a message sent via the sendMessage fixture', async ({ page }) => {
    await page.getByPlaceholder('Type words from a message…').fill('Spaceships')
    const results = page.locator('li.search-results__item')
    await expect(results).toHaveCount(1)
    await expect(results.locator('.history-exchange__text')).toHaveText(['Spaceships are neat', 'Socks in the dryer are off-chain NFTs with zero provenance.'])
  })

  test('searching for text that was never sent shows no matches', async ({ page }) => {
    await page.getByPlaceholder('Type words from a message…').fill('asteroids')
    await expect(page.locator('li.search-results__item')).toHaveCount(0)
    await expect(page.getByText('No matches for your search.')).toBeVisible()
  })
})
