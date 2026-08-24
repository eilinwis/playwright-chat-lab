import { test, expect } from '@playwright/test'

// Screen under test: Chat ("/"). Every earlier lesson used "Funny mode" (on by default) specifically to avoid needing a backend. This lesson goes the
// other way: no real backend exists in this repo, so instead of running one,we intercept the requests the app makes and answer them ourselves.

test.describe('Lesson 9: Network interception & API mocking', () => {
  test('mocking GET /api/messages seeds the chat with fixed history', async ({ page }) => {
    // Routes must be registered *before* the navigation that triggers the
    // request — page.route() intercepts requests from here on, not ones
    // already in flight.
    await page.route('**/api/messages', (route) =>
      route.fulfill({
        json: {
          messages: [
            {
              id: 'm1',
              role: 'user',
              content: 'What is Playwright?',
              timestamp: '2026-01-01T00:00:00.000Z',
            },
            {
              id: 'm2',
              role: 'assistant',
              content: 'A framework for testing web apps.',
              timestamp: '2026-01-01T00:00:01.000Z',
            },
          ],
        },
      }),
    )

    await page.goto('/')
    await expect(page.getByTestId('message-user').first()).toHaveText('What is Playwright?')
    
    await expect(page.getByTestId('message-assistant').first()).toHaveText(
      'A framework for testing web apps.',
    )
  })

  test('mocking an empty GET /api/messages response shows the same empty state as a fresh account', async ({
    page,
  }) => {
    await page.route('**/api/messages', (route) => route.fulfill({ json: { messages: [] } }))
    await page.goto('/')
    await expect(page.getByText('No messages yet.')).toBeVisible()
  })

  test('with funny mode off, sending a message hits POST /api/chat mocked here and waitForResponse observes it', async ({
    page,
  }) => {
    await page.route('**/api/messages', (route) => route.fulfill({ json: { messages: [] } }))
    await page.route('**/api/chat', (route) =>
      route.fulfill({
        json: {
          reply: {
            id: 'mock-reply-1',
            role: 'assistant',
            content: 'Mocked reply from the intercepted API.',
            timestamp: new Date().toISOString(),
          },
        },
      }),
    )

    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
    await page.getByTestId('funny-mode-toggle').uncheck()

    await page.getByTestId('chat-input').fill('What does this button do?')
    // waitForResponse doesn't replace the request (page.route already did
    // that) — it just gives the test a handle on the response so it can be
    // inspected directly, instead of only inferring success from the UI.
    const [response] = await Promise.all([
      page.waitForResponse('**/api/chat'),
      page.getByTestId('send-button').click(),
    ])
    expect(response.status()).toBe(200)

    await expect(page.getByTestId('message-assistant').last()).toHaveText(
      'Mocked reply from the intercepted API.',
    )
  })

  test('the route handler can read the request the app actually sent', async ({ page }) => {
    await page.route('**/api/messages', (route) => route.fulfill({ json: { messages: [] } }))

    // A handler doesn't only decide the response — it also holds the
    // Request the app built. Matching a URL proves the app called
    // *something*; reading the body proves it called it *correctly*.
    let sentBody: unknown
    await page.route('**/api/chat', async (route) => {
      sentBody = route.request().postDataJSON()
      await route.fulfill({
        json: {
          reply: {
            id: 'mock-reply-2',
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
    await page.getByTestId('chat-input').fill('Ducks like bread')
    await page.getByTestId('send-button').click()

    await expect(page.getByTestId('message-assistant').last()).toHaveText('Payload received.')
    // src/api/chatApi.ts builds this body — the test now fails if that
    // contract ever changes, instead of passing on a mocked reply alone.
    expect(sentBody).toEqual({ message: 'Ducks like bread' })
  })

  test('route.abort() simulates the network dropping, not the server answering', async ({ page }) => {
    await page.route('**/api/messages', (route) => route.fulfill({ json: { messages: [] } }))
    // fulfill({ status: 500 }) is a server that answered with an error;
    // abort() is no answer at all — DNS failure, offline, connection reset.
    // The app's fetch() rejects instead of resolving with !res.ok, and this
    // screen happens to surface both the same way.
    await page.route('**/api/chat', (route) => route.abort('failed'))

    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
    await page.getByTestId('funny-mode-toggle').uncheck()
    await page.getByTestId('chat-input').fill('this request never lands')
    await page.getByTestId('send-button').click()

    await expect(page.getByTestId('error-message')).toHaveText('Error: failed to get AI response')
    await expect(page.getByTestId('loading-indicator')).toHaveCount(0)
  })

  test('a failed POST /api/chat shows the app\'s own error message', async ({ page }) => {
    await page.route('**/api/messages', (route) => route.fulfill({ json: { messages: [] } }))
    await page.route('**/api/chat', (route) => route.fulfill({ status: 500, json: { error: 'boom' } }))
    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
    await page.getByTestId('funny-mode-toggle').uncheck()
    await page.getByTestId('chat-input').fill('trigger a failure')
    await page.getByTestId('send-button').click()
    await expect(page.getByTestId('error-message')).toHaveText('Error: failed to get AI response')
  })
})
