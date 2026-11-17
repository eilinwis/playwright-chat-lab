import { test, expect } from '@playwright/test'
import { sendMessage } from './helpers'

const DUCKS_QUESTION = 'Ducks like bread'
const DUCKS_ANSWER = 'Ducks think breadcrumbs are cryptocurrency with excellent UX.'
const PROGRAMMERS_QUESTION = 'Programmers unite'

test.describe('Homework 2: Locators & actions', () => {
  test('searching finds a sent message, and clearing the query resets the view', async ({ page }) => {
    const searchInput = page.getByRole('searchbox', { name: 'Search' })
    const hint = page.getByText('Enter text to search your local history.')
    const results = page.locator('li.search-results__item')

    await page.goto('/')
    await sendMessage(page, DUCKS_QUESTION)
    await sendMessage(page, PROGRAMMERS_QUESTION)

    await page.getByTestId('nav-tab-search').click()
    await expect(page).toHaveURL(/\/search$/)

    await searchInput.fill('Ducks')
    await expect(hint).toBeHidden()
    await expect(results).toHaveCount(1)
    await expect(results.locator('.history-exchange__text')).toHaveText([DUCKS_QUESTION, DUCKS_ANSWER])
    await expect(results).not.toContainText(PROGRAMMERS_QUESTION)

    await searchInput.clear()
    await expect(searchInput).toHaveValue('')
    await expect(hint).toBeVisible()
    await expect(results).toHaveCount(0)
  })
})
