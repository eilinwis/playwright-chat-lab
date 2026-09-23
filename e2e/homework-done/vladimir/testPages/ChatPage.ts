import { expect, type Locator, type Page } from '@playwright/test'

export class ChatPage {
  readonly page: Page
  readonly funnyModeToggle: Locator
  readonly chatInput: Locator
  readonly sendButton: Locator
  readonly lastUserMessage: Locator
  readonly lastAssistantMessage: Locator

  constructor(page: Page) {
    this.lastUserMessage = page.getByTestId('message-user').last()
    this.lastAssistantMessage = page.getByTestId('message-assistant').last()
    this.funnyModeToggle = page.getByTestId('funny-mode-toggle')
    this.chatInput = page.getByTestId('chat-input')
    this.sendButton = page.getByTestId('send-button')
    this.page = page
  }

  async sendMessage(text: string) {
    await this.chatInput.fill(text)
    await this.sendButton.click()
    await expect(this.lastAssistantMessage).toBeVisible()
  }

  async goto() {
    await this.page.goto('/')
    await expect(this.chatInput).toBeEnabled({ timeout: 15_000 })
  }
}
