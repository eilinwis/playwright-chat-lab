import type { Locator, Page } from '@playwright/test'

export class HistoryPage {
  readonly page: Page
  readonly deleteButton: Locator
  readonly historyItems: Locator

  constructor(page: Page) {
    this.page = page
    this.deleteButton = page.getByTestId('delete-history-button')
    this.historyItems = page.locator('li.history-day__item')
  }

  async goto() {
    await this.page.getByTestId('nav-tab-history').click()
  }
}
