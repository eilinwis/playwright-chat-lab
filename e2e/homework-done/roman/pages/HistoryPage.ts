import { type Locator, type Page } from '@playwright/test'

/**
 * Homework 7, step 1 — the finished page object for the Message history
 * screen ("/history"). Like SearchPage, it holds no assertions: it only
 * exposes what the screen has and what you can do to it.
 */
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
