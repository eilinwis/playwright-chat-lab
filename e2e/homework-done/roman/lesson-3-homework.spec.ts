import { test, expect, type Page } from '@playwright/test'

/**
 * Homework 3 — Assertions & auto-waiting
 *
 * Screen under test: Message history — the same screen as demo.spec.ts,
 * at "/history".
 *
 * Complete the test below:
 *   1. Go to "/history" directly (no messages sent yet) and assert:
 *        - the delete button (data-testid="delete-history-button") is disabled
 *        - there are 0 elements matching "li.history-day__item" (toHaveCount)
 *   2. Go to the chat page ("/") and send three messages, waiting for each
 *      reply before sending the next:
 *        - "Gravity always wins"
 *        - "How odd"
 *        - "If only"
 *   3. Go back to Message history and assert:
 *        - there are now exactly 3 "li.history-day__item" elements
 *        - the delete button is enabled
 *   4. Using expect.soft (so both checks run even if one fails), assert
 *      that the first history entry's two .history-exchange__text elements
 *      read "Gravity always wins" and
 *      "Gravity is just the Earth being clingy in a scientifically dignified way."
 */

async function sendChatMessage(page: Page, text: string, expectedReplyCount: number) {
  const chatInput = page.getByTestId('chat-input')
  const sendButton = page.getByTestId('send-button')

  await expect(chatInput).toBeEnabled({ timeout: 15_000 })
  await chatInput.fill(text)
  await sendButton.click()
  await expect(page.getByTestId('message-assistant')).toHaveCount(expectedReplyCount)
}

test.describe('Homework 3: Assertions & auto-waiting', () => {
  test('history starts empty, then fills up and enables delete as messages are sent', async ({ page }) => {
    const deleteButton = page.getByTestId('delete-history-button')
    const items = page.locator('li.history-day__item')
    await page.goto('/history')
    await expect(deleteButton).toBeDisabled()
    await expect(items).toHaveCount(0)
    await page.goto('/')
    await sendChatMessage(page, 'Gravity always wins', 1)
    await sendChatMessage(page, 'How odd', 2)
    await sendChatMessage(page, 'If only', 3)
    await page.getByTestId('nav-tab-history').click()
    await expect(page).toHaveURL(/\/history$/)
    await expect(items).toHaveCount(3)
    await expect(deleteButton).toBeEnabled()
    const firstTexts = items.first().locator('.history-exchange__text')
    await expect.soft(firstTexts.first()).toHaveText('Gravity always wins')
    await expect.soft(firstTexts.last()).toHaveText(
      'Gravity is just the Earth being clingy in a scientifically dignified way.',
    )
  })
})
