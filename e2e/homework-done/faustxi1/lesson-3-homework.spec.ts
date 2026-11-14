import { test, expect, type Page } from '@playwright/test'

async function sendMessage(page: Page, text: string) {
  const chatInput = page.getByTestId('chat-input')
  await expect(chatInput).toBeEnabled({ timeout: 15000 })
  await chatInput.fill(text)
  await page.getByTestId('send-button').click()
  await expect(page.getByTestId('message-assistant').last()).toBeVisible()
}

test.describe('Homework 3: Assertions & auto-waiting', () => {
  test('history starts empty, then fills up and enables delete as messages are sent', async ({ page }) => {
    await page.goto('/history')

    const deleteButton = page.getByTestId('delete-history-button')
    const items = page.locator('li.history-day__item')

    await expect(deleteButton).toBeDisabled()
    await expect(items).toHaveCount(0)

    await page.goto('/')
    await sendMessage(page, 'Gravity always wins')
    await sendMessage(page, 'How odd')
    await sendMessage(page, 'If only')

    await page.getByTestId('nav-tab-history').click()

    await expect(items).toHaveCount(3)
    await expect(deleteButton).toBeEnabled()

    const texts = items.nth(0).locator('.history-exchange__text')
    await expect.soft(texts.nth(0)).toHaveText('Gravity always wins')
    await expect.soft(texts.nth(1)).toHaveText('Gravity is just the Earth being clingy in a scientifically dignified way.')
  })
})
