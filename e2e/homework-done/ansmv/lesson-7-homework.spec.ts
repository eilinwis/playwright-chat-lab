import { test, expect } from '@playwright/test'
import { ChatPage } from './pages/ChatPage'
import { HistoryPage } from './pages/HistoryPage'

/**
 * Homework 7 — Page Object Model
 *
 * Screens under test: Chat ("/") to seed messages, then Message history
 * ("/history") — the same screens as Lesson 3, now organized as page
 * objects instead of raw locators.
 *
 *   1. `pages/HistoryPage.ts` is finished (deleteButton, historyItems, goto)
 *   2. Both page objects are imported above
 *   3. The test only drives them and asserts — no raw locators in here
 */
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
