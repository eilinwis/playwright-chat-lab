import { test, expect } from '@playwright/test'
import { ChatPage } from './testPages/ChatPage'
import { HistoryPage } from './testPages/HistoryPage'

test.describe('Homework 7: Page Object Model', () => {
  test('sent messages show up as history entries via page objects', async ({ page }) => {
    const chatPage = new ChatPage(page)
    await chatPage.goto()
    await chatPage.sendMessage('Gravity always wins')
    await chatPage.sendMessage('How odd')
    const historyPage = new HistoryPage(page)
    await historyPage.goto()
    await expect(page).toHaveURL(/\/history$/)
    await expect(historyPage.historyItems).toHaveCount(2)
    await expect(historyPage.deleteButton).toBeEnabled()
  })
})
