import { expect, type Locator, type Page } from '@playwright/test'

export class ChatPage {
  readonly page: Page
  readonly funnyModeToggle: Locator
  readonly chatInput: Locator
  readonly sendButton: Locator
  readonly resetButton: Locator
  readonly lastUserMessage: Locator
  readonly lastAssistantMessage: Locator
  readonly userMessages: Locator
  readonly assistantMessages: Locator
  readonly loadingIndicator: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    this.lastUserMessage = page.getByTestId('message-user').last()
    this.lastAssistantMessage = page.getByTestId('message-assistant').last()
    this.userMessages = page.getByTestId('message-user')
    this.assistantMessages = page.getByTestId('message-assistant')
    this.funnyModeToggle = page.getByTestId('funny-mode-toggle')
    this.chatInput = page.getByTestId('chat-input')
    this.sendButton = page.getByTestId('send-button')
    this.resetButton = page.getByTestId('reset-button')
    this.loadingIndicator = page.getByTestId('loading-indicator')
    this.emptyState = page.getByText('No messages yet.')
    this.page = page
  }

  async sendMessage(text: string) {
    await this.chatInput.fill(text)
    await this.sendButton.click()
    await expect(this.lastAssistantMessage).toBeVisible()
  }

  async sendNoWait(text: string) {
    await this.chatInput.fill(text)
    await this.sendButton.click()
  }

  async assistantMode() {
    await this.funnyModeToggle.uncheck()
  }

  async goto() {
    await this.page.goto('/')
    await expect(this.chatInput).toBeEnabled({ timeout: 15_000 })
  }
}
