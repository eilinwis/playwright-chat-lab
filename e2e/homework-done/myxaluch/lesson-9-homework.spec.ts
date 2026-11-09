import { test, expect } from '@playwright/test'

/**
 * Homework 9 — Network interception & API mocking
 *
 * Screen under test: Chat ("/") — mocking the two endpoints demo.spec.ts
 * didn't cover (POST /api/reset and a deliberately slow POST /api/chat), and
 * then asserting on the request the app sends rather than the reply it gets
 * back.
 */
test.describe('Homework 9: Network interception & API mocking', () => {
  /**
   * Test 1 — mocking Reset Chat
   */
  test('mocking a successful POST /api/reset clears the chat', async ({ page }) => {
    // Every route has to be registered before the navigation that triggers
    // the request.
    await page.route('**/api/messages', (route) => route.fulfill({ json: { messages: [] } }))
    // `{ status: 'ok' }` is the only shape resetChat() (src/api/chatApi.ts)
    // treats as success.
    await page.route('**/api/reset', (route) => route.fulfill({ json: { status: 'ok' } }))

    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })

    await page.getByTestId('chat-input').fill('Bananas are great')
    await page.getByTestId('send-button').click()
    await expect(page.getByTestId('message-assistant').last()).toBeVisible()

    // The click clears the thread on screen without waiting on the network,
    // so pairing it with waitForResponse is what actually proves the mock
    // was hit rather than just watching the UI empty out.
    const [response] = await Promise.all([
      page.waitForResponse('**/api/reset'),
      page.getByTestId('reset-button').click(),
    ])
    expect(response.status()).toBe(200)

    await expect(page.getByTestId('message-user')).toHaveCount(0)
    await expect(page.getByTestId('message-assistant')).toHaveCount(0)
    await expect(page.getByText('No messages yet.')).toBeVisible()
  })

  /**
   * Test 2 — a slow response and the loading indicator
   */
  test('a delayed POST /api/chat response shows the loading indicator until it resolves', async ({
    page,
  }) => {
    await page.route('**/api/messages', (route) => route.fulfill({ json: { messages: [] } }))
    await page.route('**/api/chat', async (route) => {
      // Hold the response back long enough for the loading state to be
      // observable — without the delay the reply can land before the very
      // first assertion runs.
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
    // A real request only fires with funny mode off.
    await page.getByTestId('funny-mode-toggle').uncheck()

    await page.getByTestId('chat-input').fill('What does this button do?')
    await page.getByTestId('send-button').click()

    // Has to win the race against the 500ms delay, so it goes first.
    await expect(page.getByTestId('loading-indicator')).toBeVisible()

    await expect(page.getByTestId('message-assistant').last()).toHaveText(
      'A slow but mocked reply.',
    )
    await expect(page.getByTestId('loading-indicator')).toHaveCount(0)
  })

  /**
   * Test 3 — asserting the request, not the reply
   */
  test('the app sends the exact payload src/api/chatApi.ts promises', async ({ page }) => {
    await page.route('**/api/messages', (route) => route.fulfill({ json: { messages: [] } }))

    // A handler holds the Request the app built, not just the response it
    // gets to decide — capture both into the test's own scope.
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

    // The route handler runs asynchronously — waiting for the mocked reply
    // to render is what guarantees the captured variables are filled in by
    // the time they're read.
    await expect(page.getByTestId('message-assistant').last()).toHaveText('Payload received.')

    expect(sentMethod).toBe('POST')
    // It sends `message`, not `text` or `content`. A mocked reply renders
    // either way, so this is the only assertion that catches that contract
    // (src/api/chatApi.ts) changing.
    expect(sentBody).toEqual({ message: 'Ostriches assemble' })
  })
})
