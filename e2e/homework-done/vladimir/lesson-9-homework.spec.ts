import { test, expect, type Page } from '@playwright/test'
import { ChatPage } from './testPages/ChatPage'

const mockEmptyHistory = (page: Page) =>
  page.route('**/api/messages', (route) => route.fulfill({ json: { messages: [] } }))

function assistantReply(content: string) {
  return {
    reply: {
      id: `mock-${content.length}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
    },
  }
}

test.describe('Homework 9: Network interception & API mocking', () => {
  test('mocking a successful POST /api/reset clears the chat', async ({ page }) => {
    await mockEmptyHistory(page)
    await page.route('**/api/reset', (route) => route.fulfill({ json: { status: 'ok' } }))

    const chat = new ChatPage(page)
    await chat.goto()
    await chat.sendMessage('Bananas are great')

    const [res] = await Promise.all([
      page.waitForResponse('**/api/reset'),
      chat.resetButton.click(),
    ])
    expect(res.status()).toBe(200)

    await expect(chat.userMessages).toHaveCount(0)
    await expect(chat.assistantMessages).toHaveCount(0)
    await expect(chat.emptyState).toBeVisible()
  })

  test('a delayed POST /api/chat response shows the loading indicator until it resolves', async ({
    page,
  }) => {
    const REPLY = 'Мокнутый ответ, но с задержкой.'

    await mockEmptyHistory(page)
    await page.route('**/api/chat', async (route) => {
      await new Promise((r) => setTimeout(r, 500))
      await route.fulfill({ json: assistantReply(REPLY) })
    })

    const chat = new ChatPage(page)
    await chat.goto()
    await chat.assistantMode()
    await chat.sendNoWait('What does this button do?')
    await expect(chat.loadingIndicator).toBeVisible()

    await expect(chat.lastAssistantMessage).toHaveText(REPLY)
    await expect(chat.loadingIndicator).toHaveCount(0)
  })

  test('the app sends the exact payload src/api/chatApi.ts promises', async ({ page }) => {
    await mockEmptyHistory(page)

    const sent: { method?: string; body?: unknown } = {}
    await page.route('**/api/chat', async (route) => {
      sent.method = route.request().method()
      sent.body = route.request().postDataJSON()
      await route.fulfill({ json: assistantReply('Payload received.') })
    })

    const chat = new ChatPage(page)
    await chat.goto()
    await chat.assistantMode()
    await chat.sendNoWait('Ostriches assemble')

    await expect(chat.lastAssistantMessage).toHaveText('Payload received.')

    expect(sent.method).toBe('POST')
    expect(sent.body).toEqual({ message: 'Ostriches assemble' })
  })
})
