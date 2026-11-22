import { test, expect } from '@playwright/test'
import { ChatPage } from './pages/ChatPage'
import { HistoryPage } from './pages/HistoryPage'

test('sent messages show up as history entries via page objects', async ({ page }) => {
  const chat = new ChatPage(page)
  await chat.goto()
  await chat.sendMessage('Gravity always wins')
  await chat.sendMessage('How odd')
  const history = new HistoryPage(page)
  await history.goto()
  await expect(page).toHaveURL(/\/history$/)
  await expect(history.historyItems).toHaveCount(2)
  await expect(history.deleteButton).toBeEnabled()
})
