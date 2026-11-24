import { test, expect } from '@playwright/test'
import { waitForChatReady } from './helpers'

const reply = (content: string) => ({
  reply: { id: crypto.randomUUID(), role: 'assistant', content, timestamp: new Date().toISOString() },
})

test.describe('Homework 9: Network interception & API mocking', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/messages', (r) => r.fulfill({ json: { messages: [] } }))
  })

  test('mocking a successful POST /api/reset clears the chat', async ({ page }) => {
    await page.route('**/api/reset', (r) => r.fulfill({ json: { status: 'ok' } }))
    await page.goto('/')
    await waitForChatReady(page)
    await page.getByTestId('chat-input').fill('Bananas are great')
    await page.getByTestId('send-button').click()
    await expect(page.getByTestId('message-assistant').last()).toBeVisible()
    const [res] = await Promise.all([page.waitForResponse('**/api/reset'), page.getByTestId('reset-button').click()])
    expect(res.status()).toBe(200)
    await expect(page.getByTestId('message-user')).toHaveCount(0)
    await expect(page.getByTestId('message-assistant')).toHaveCount(0)
    await expect(page.getByText('No messages yet.')).toBeVisible()
  })

  test('a delayed POST /api/chat response shows the loading indicator until it resolves', async ({ page }) => {
    await page.route('**/api/chat', async (r) => {
      await new Promise((res) => setTimeout(res, 500))
      await r.fulfill({ json: reply('Slow but steady') })
    })
    await page.goto('/')
    await waitForChatReady(page)
    await page.getByTestId('funny-mode-toggle').uncheck()
    await page.getByTestId('chat-input').fill('Hello')
    await page.getByTestId('send-button').click()
    await expect(page.getByTestId('loading-indicator')).toBeVisible()
    await expect(page.getByTestId('message-assistant').last()).toHaveText('Slow but steady')
    await expect(page.getByTestId('loading-indicator')).toHaveCount(0)
  })

  test('the app sends the exact payload src/api/chatApi.ts promises', async ({ page }) => {
    let body: unknown
    let method: string | undefined
    await page.route('**/api/chat', async (r) => {
      body = r.request().postDataJSON()
      method = r.request().method()
      await r.fulfill({ json: reply('Captured') })
    })
    await page.goto('/')
    await waitForChatReady(page)
    await page.getByTestId('funny-mode-toggle').uncheck()
    await page.getByTestId('chat-input').fill('Ostriches assemble')
    await page.getByTestId('send-button').click()
    await expect(page.getByTestId('message-assistant').last()).toHaveText('Captured')
    expect(method).toBe('POST')
    expect(body).toEqual({ message: 'Ostriches assemble' })
  })
})
