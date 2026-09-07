import { test, expect } from '@playwright/test'


test.describe('Homework 9: Network interception & API mocking', () => {

  test('mocking a successful POST /api/reset clears the chat', async ({ page }) => {

    await page.route('**/api/messages', (route) => route.fulfill({ json: { messages: [] } }))
    await page.route('**/api/reset', (route) => route.fulfill({ json: { status: 'ok' } }))

    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })

    await page.getByTestId('chat-input').fill('Bananas are great')
    await page.getByTestId('send-button').click()
    await expect(page.getByTestId('message-assistant').last()).toBeVisible()
    const [response] = await Promise.all([
      page.waitForResponse('**/api/reset'),
      page.getByTestId('reset-button').click(),
    ])
    expect(response.status()).toBe(200)

    await expect(page.getByTestId('message-user')).toHaveCount(0)
    await expect(page.getByTestId('message-assistant')).toHaveCount(0)
    await expect(page.getByText('No messages yet.')).toBeVisible()
  })

  test('a delayed POST /api/chat response shows the loading indicator until it resolves', async ({
    page,
  }) => {
    await page.route('**/api/messages', (route) => route.fulfill({ json: { messages: [] } }))
    await page.route('**/api/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.fulfill({
        json: {
          reply: {
            id: 'mock-slow-reply',
            role: 'assistant',
            content: 'A slow but mocked reply.',
            timestamp: new Date().toISOString(),
          },
        },
      })
    })

    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
    await page.getByTestId('funny-mode-toggle').uncheck()

    await page.getByTestId('chat-input').fill('What does this button do?')
    await page.getByTestId('send-button').click()

    await expect(page.getByTestId('loading-indicator')).toBeVisible()

    await expect(page.getByTestId('message-assistant').last()).toHaveText(
      'A slow but mocked reply.',
    )
    await expect(page.getByTestId('loading-indicator')).toHaveCount(0)
  })

  test('the app sends the exact payload src/api/chatApi.ts promises', async ({ page }) => {
    await page.route('**/api/messages', (route) => route.fulfill({ json: { messages: [] } }))
    let sentMethod: string | undefined
    let sentBody: unknown
    await page.route('**/api/chat', async (route) => {
      sentMethod = route.request().method()
      sentBody = route.request().postDataJSON()
      await route.fulfill({
        json: {
          reply: {
            id: 'mock-payload-reply',
            role: 'assistant',
            content: 'Payload received.',
            timestamp: new Date().toISOString(),
          },
        },
      })
    })

    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
    await page.getByTestId('funny-mode-toggle').uncheck()

    await page.getByTestId('chat-input').fill('Ostriches assemble')
    await page.getByTestId('send-button').click()
    await expect(page.getByTestId('message-assistant').last()).toHaveText('Payload received.')

    expect(sentMethod).toBe('POST')
    expect(sentBody).toEqual({ message: 'Ostriches assemble' })
  })
})
