import { test, expect, type Page } from '@playwright/test'

/**
 * Homework 8 — Navigation & browser contexts
 *
 * Screens under test: Chat ("/") to seed a message, then Search ("/search")
 * to look for it — the same screens as Lesson 2, now crossing browser
 * contexts instead of staying on one page.
 */

async function sendMessage(page: Page, text: string) {
  const chatInput = page.getByTestId('chat-input')
  const sendButton = page.getByTestId('send-button')
  await expect(chatInput).toBeEnabled({ timeout: 15_000 })
  await chatInput.fill(text)
  await sendButton.click()
  await expect(page.getByTestId('message-assistant').last()).toBeVisible()
}

test.describe('Homework 8: Navigation & browser contexts', () => {
  /**
   * Test 1 — isolation
   */
  test('fresh browser context never sees search results of another context', async ({
    page,
    browser,
  }) => {
    await page.goto('/')
    await sendMessage(page, 'Spaceships are neat')

    // A brand-new context starts with empty cookies and empty localStorage,
    // so the history the first one just wrote is invisible here.
    const newContext = await browser.newContext()
    const newPage = await newContext.newPage()

    await newPage.goto('/search')
    await newPage.getByPlaceholder('Type words from a message…').fill('Spaceships')

    await expect(newPage.getByText('No matches for your search.')).toBeVisible()
    await expect(newPage.locator('li.search-results__item')).toHaveCount(0)

    await newContext.close()
  })

  /**
   * Test 2 — reusing storageState
   */
  test('reusing a saved storageState finds a message without resending it', async ({
    page,
    context,
    browser,
  }) => {
    await page.goto('/')
    await sendMessage(page, 'Programmers unite')

    const storageState = await context.storageState()

    const seededContext = await browser.newContext({ storageState })
    const seededPage = await seededContext.newPage()

    await seededPage.goto('/search')
    await seededPage.getByPlaceholder('Type words from a message…').fill('Programmers')

    const results = seededPage.locator('li.search-results__item')
    await expect(results).toHaveCount(1)
    await expect(results.first().locator('.history-exchange__text').first()).toHaveText(
      'Programmers unite',
    )

    await seededContext.close()
  })
})
