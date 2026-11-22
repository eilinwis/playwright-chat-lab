import { test, expect, type Page } from '@playwright/test'

async function sendMessage(page: Page, text: string) {
  await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
  await page.getByTestId('chat-input').fill(text)
  await page.getByTestId('send-button').click()
  await expect(page.getByTestId('message-assistant').last()).toBeVisible()
}

test('fresh browser context never sees search results of another context', async ({ page, browser }) => {
  await page.goto('/')
  await sendMessage(page, 'Spaceships are neat')
  const ctx = await browser.newContext()
  const p = await ctx.newPage()
  await p.goto('/search')
  await p.getByPlaceholder('Type words from a message…').fill('Spaceships')
  await expect(p.getByText('No matches for your search.')).toBeVisible()
  await expect(p.locator('li.search-results__item')).toHaveCount(0)
  await ctx.close()
})

test('reusing a saved storageState finds a message without resending it', async ({ page, context, browser }) => {
  await page.goto('/')
  await sendMessage(page, 'Programmers unite')
  const ctx = await browser.newContext({ storageState: await context.storageState() })
  const p = await ctx.newPage()
  await p.goto('/search')
  await p.getByPlaceholder('Type words from a message…').fill('Programmers')
  const results = p.locator('li.search-results__item')
  await expect(results).toHaveCount(1)
  await expect(results.first().locator('.history-exchange__text').first()).toHaveText('Programmers unite')
  await ctx.close()
})
