import { test, expect, type Page } from '@playwright/test'

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
