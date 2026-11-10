import { test, expect } from '@playwright/test'


test.describe('Homework 3: Assertions & auto-waiting', () => {
  test('history starts empty, then fills up and enables delete as messages are sent', async ({ page }) => {
    await page.goto('http://localhost:5173/history')

    const deleteButton = page.getByTestId('delete-history-button')
    const items = page.locator('li.history-day__item')
    await expect(deleteButton).toBeDisabled()
    expect(await items.count()).toBe(0)

    await page.goto('/')
    const chatInput = page.getByTestId('chat-input')
    await expect(chatInput).toBeEnabled({ timeout: 60_000 })

    for (const message of ['Gravity always wins', 'How odd', 'If only']) {
      await chatInput.fill(message)
      await page.getByTestId('send-button').click()
      await page.waitForTimeout(1000)
    }

    await page.locator('nav.app-nav > a:nth-child(3)').click()

    await expect(items).toHaveCount(3)
    await expect(deleteButton).toBeEnabled()

    const texts = items.first().locator('.history-exchange__text')

    await expect(texts.first()).toHaveText('Gravity always wins')
    await expect(texts.last()).toContainText('Gravity is just the Earth')
  })
})
