import { test, expect, type Page } from '@playwright/test'

async function sendMessage(page: Page, text: string) {
  const chatInput = page.getByTestId('chat-input')
  await expect(chatInput).toBeEnabled({ timeout: 15000 })
  await chatInput.fill(text)
  await page.getByTestId('send-button').click()
  await expect(page.getByTestId('message-assistant').last()).toBeVisible()
}

test.describe('Homework 2: Locators & actions', () => {
  test('searching finds a sent message, and clearing the query resets the view', async ({ page }) => {
    await page.goto('/')
    await sendMessage(page, 'Ducks like bread')
    await sendMessage(page, 'Programmers unite')

    await page.getByTestId('nav-tab-search').click()

    const searchInput = page.locator('.search-field__input')
    await searchInput.fill('Ducks')

    const results = page.locator('li.search-results__item')
    await expect(results).toHaveCount(1)

    const texts = results.locator('.history-exchange__text')
    await expect(texts.first()).toHaveText('Ducks like bread')
    await expect(texts.last()).toHaveText('Ducks think breadcrumbs are cryptocurrency with excellent UX.')

    await searchInput.fill('')

    await expect(page.getByText('Enter text to search your local history.')).toBeVisible()
    await expect(results).toHaveCount(0)
  })
})
