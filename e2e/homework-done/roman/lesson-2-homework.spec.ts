import { test, expect } from '@playwright/test'


/**
 * Homework 2 — Locators & actions
 *
 * Screen under test: Search in chats — the same screen as demo.spec.ts,
 * at "/search".
 *
 * Complete the test below:
 *   1. Go to the chat page ("/") and send two messages, waiting for each
 *      reply before sending the next:
 *        - "Ducks like bread"
 *        - "Programmers unite"
 *   2. Go to the Search screen (click the tab with data-testid "nav-tab-search")
 *   3. Search for "Ducks"
 *   4. Assert exactly one result is shown (li.search-results__item)
 *   5. Within that result, assert the two .history-exchange__text elements
 *      read "Ducks like bread" and
 *      "Ducks think breadcrumbs are cryptocurrency with excellent UX."
 *   6. Clear the search box (fill it with an empty string)
 *   7. Assert the hint "Enter text to search your local history." is visible
 *      again, and that there are no result items
 *
 * Delete the `test.fixme()` line once your test is complete and passing.
 */
test.describe('Homework 2: Locators & actions', () => {
  test('searching finds a sent message, and clearing the query resets the view', async ({page}) => {
    const chatInput = page.getByTestId('chat-input')
    const sendButton = page.getByTestId('send-button')
    const searchTab = page.getByTestId('nav-tab-search')
    await page.goto('/')
    await expect(chatInput).toBeEnabled({ timeout: 15_000 })
    await chatInput.fill('Ducks like bread')
    await sendButton.click()
    await chatInput.fill('Programmers unite')
    await sendButton.click()
    await searchTab.click()

    const searchInput = page.getByPlaceholder('Type words from a message…')
    await searchInput.fill('Ducks')

    const results = page.locator('li.search-results__item')
    await expect(results).toHaveCount(1)

    const ducksResult = results.filter({ hasText: 'Ducks' })
    const texts = ducksResult.locator('.history-exchange__text')
    await expect(texts.first()).toHaveText('Ducks like bread')
    await expect(texts.last()).toHaveText(
      'Ducks think breadcrumbs are cryptocurrency with excellent UX.',
    )

    await searchInput.fill('')
    await expect(page.getByText('Enter text to search your local history.')).toBeVisible()
    await expect(results).toHaveCount(0)
    await expect(ducksResult).toBeHidden()

  })
})
