import { test, expect, type Browser, type BrowserContextOptions } from '@playwright/test'
import { ChatPage } from './testPages/ChatPage'
import { SearchPage } from './testPages/SearchPage'

async function openSearchInNewContext(browser: Browser, options: BrowserContextOptions = {}) {
  const ctx = await browser.newContext(options)
  const search = new SearchPage(await ctx.newPage())
  await search.goto()
  return { ctx, search }
}

test.describe('Homework 8: Navigation & browser contexts', () => {
  test('fresh browser context never sees search results of another context', async ({
    page,
    browser,
  }) => {
    const chat = new ChatPage(page)
    await chat.goto()
    await chat.sendMessage('Spaceships are neat')

    const { ctx, search } = await openSearchInNewContext(browser)
    await search.find('Spaceships')

    await expect(search.noMatches).toBeVisible()
    await expect(search.results).toHaveCount(0)

    await ctx.close()
  })

  test('reusing a saved storageState finds a message without resending it', async ({
    page,
    context,
    browser,
  }) => {
    const chat = new ChatPage(page)
    await chat.goto()
    await chat.sendMessage('Programmers unite')

    const storageState = await context.storageState()
    const { ctx, search } = await openSearchInNewContext(browser, { storageState })
    await search.find('Programmers')

    await expect(search.results).toHaveCount(1)
    await expect(search.exchange().first()).toHaveText('Programmers unite')

    await ctx.close()
  })
})
