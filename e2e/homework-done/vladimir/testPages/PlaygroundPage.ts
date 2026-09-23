import { type Locator, type Page } from '@playwright/test'

export class PlaygroundPage {
  readonly page: Page
  readonly gallery: Locator
  readonly galleryImage: Locator
  readonly galleryCaption: Locator

  constructor(page: Page) {
    this.gallery = page.getByTestId('playground-section-gallery')
    this.galleryImage = page.getByTestId('gallery-main-image')
    this.galleryCaption = page.getByTestId('gallery-caption')
    this.page = page
  }

  async goto() {
    await this.page.goto('/playground')
  }

  thumb(id: string): Locator {
    return this.page.getByTestId(`gallery-thumb-${id}`)
  }
}
