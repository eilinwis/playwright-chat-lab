import { type Locator, type Page } from '@playwright/test'

export class HistoryPage {
  readonly page: Page
  readonly deleteButton: Locator
  readonly historyItems: Locator

  constructor(page: Page) {
    this.deleteButton = page.getByTestId('delete-history-button')
    this.historyItems = page.locator('li.history-day__item')
    this.page = page
  }

  async goto() {
    await this.page.getByTestId('nav-tab-history').click()
    
  }
}
