import { test as base, expect } from '@playwright/test'

/**
 * Homework 6 — Hooks & fixtures
 *
 * Screens under test: Chat ("/") to seed messages, then Search ("/search")
 * to find them — the same screens as Lesson 2, now organized with a custom
 * fixture and a beforeEach instead of a helper function called manually in
 * every test.
 *
 *   1. A `sendMessage` fixture, typed `(text: string) => Promise<void>`
 *   2. A `test.beforeEach` that seeds two messages and lands on Search
 *   3. First test: searching for "Spaceships" finds exactly one exchange
 *   4. Second test: searching for "asteroids" finds nothing
 */

interface Fixtures {
  sendMessage: (text: string) => Promise<void>
}

// Shadows the `test` imported from '@playwright/test' for the rest of the
// file, so every test and hook below can ask for `sendMessage` by name.
const test = base.extend<Fixtures>({
  sendMessage: async ({ page }, use) => {
    async function send(text: string) {
      const chatInput = page.getByTestId('chat-input')
      const sendButton = page.getByTestId('send-button')
      await expect(chatInput).toBeEnabled({ timeout: 15_000 })
      await chatInput.fill(text)
      await sendButton.click()
      await expect(page.getByTestId('message-assistant').last()).toBeVisible()
    }
    await use(send)
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

    const texts = results.first().locator('.history-exchange__text')
    await expect(texts.first()).toHaveText('Spaceships are neat')
    await expect(texts.last()).toHaveText(
      'Socks in the dryer are off-chain NFTs with zero provenance.',
    )
  })

  test('searching for text that was never sent shows no matches', async ({ page }) => {
    await page.getByPlaceholder('Type words from a message…').fill('asteroids')

    await expect(page.locator('li.search-results__item')).toHaveCount(0)
    await expect(page.getByText('No matches for your search.')).toBeVisible()
  })
})
