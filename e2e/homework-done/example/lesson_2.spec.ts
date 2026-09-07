import { test, expect } from '@playwright/test'

test.describe('Homework 2: Locators & actions', () => {
  test('searching finds a sent message, and clearing the query resets the view', async ({page}) => {
    const sendButton = page.getByTestId('send-button')
    const searchTab = page.getByTestId('nav-tab-search')
    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
    await page.getByTestId('chat-input').fill('Ducks like bread')
    await sendButton.click()
    await page.getByTestId('chat-input').fill('Programmers unite')
    await sendButton.click()
    await searchTab.click()
    await page.getByPlaceholder('Type words from a message…').fill('Ducks')
    const results = page.locator('li.search-results__item')
    await expect(results).toHaveCount(1)
    const ducksResult = results.filter({ hasText: 'Ducks' })
    const texts = ducksResult.locator('.history-exchange__text')
    await expect(texts.first()).toHaveText('Ducks like bread')
    await expect(texts.last()).toHaveText(
      'Ducks think breadcrumbs are cryptocurrency with excellent UX.',
    )


    await page.getByPlaceholder('Type words from a message…').fill('')
    await expect(page.getByText('Enter text to search your local history.')).toBeVisible()
    await expect(results).toHaveCount(0)
    await expect(ducksResult).toBeHidden()
  })
})
