import { expect, type Locator, type Page } from '@playwright/test'

export class SearchPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly results: Locator
  readonly noMatches: Locator

  constructor(page: Page) {
    this.searchInput = page.getByPlaceholder('Type words from a message…')
    this.results = page.locator('li.search-results__item')
    this.noMatches = page.getByText('No matches for your search.')
    this.page = page
  }

  async goto() {
    await this.page.goto('/search')
  }

  async openFromNav() {
    await this.page.getByTestId('nav-tab-search').click()
    await expect(this.page).toHaveURL(/\/search$/)
  }

  async find(query: string) {
    await this.searchInput.fill(query)
  }

  exchange(index = 0): Locator {
    return this.results.nth(index).locator('.history-exchange__text')
  }
}
