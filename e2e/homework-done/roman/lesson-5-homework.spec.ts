import { test, expect } from '@playwright/test'

/**
 * Homework 5 — Custom widgets & complex interactions
 *
 * Screen under test: Playground ("/playground") — the Calendar, Modal,
 * Filter, and Gallery widgets.
 */
test.describe('Homework 5: Custom widgets & complex interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground')
  })


  test('navigating and selecting a date in the calendar, then confirming the modal', async ({ page }) => {
    const heading = page.getByTestId('calendar-heading')

    await expect(page.getByTestId('playground-section-calendar')).toBeVisible()
    await expect(heading).toHaveText(/^[A-Za-z]+ \d{4}$/)
    const startingHeading = await heading.textContent()

    await page.getByTestId('calendar-next').click()
    await page.getByTestId('calendar-next').click()
    await expect(heading).not.toHaveText(startingHeading || 'text')

    const firstDay = page.locator('[data-testid^="calendar-day-"]').first()
    const testId = await firstDay.getAttribute('data-testid')
    const iso = testId.replace('calendar-day-', '')

    await firstDay.click()
    await expect(page.getByTestId('calendar-selected-date')).toHaveText(`Selected: ${iso}`)

    const dialog = page.getByTestId('modal-dialog')
    await page.getByTestId('modal-open-button').click()
    await expect(dialog).toBeVisible()
    await page.getByTestId('modal-confirm-button').click()

    await expect(dialog).toBeHidden()
    await expect(page.getByTestId('modal-result')).toHaveText('Last action: confirmed')
  })

  test('combining a category toggle with a search query narrows and resets the results', async ({ page }) => {
    const frontendToggle = page.getByTestId('filter-category-frontend')
    const searchInput = page.getByTestId('filter-search-input')
    const results = page.getByTestId('filter-results-list').locator('li')

    await expect(page.getByTestId('playground-section-filter')).toBeVisible()

    await frontendToggle.click()
    await expect(frontendToggle).toHaveAttribute('aria-pressed', 'true')

    await expect(results).toHaveCount(2)
    await expect(page.getByTestId('filter-result-p1')).toBeVisible()
    await expect(page.getByTestId('filter-result-p5')).toBeVisible()

    await searchInput.fill('board')
    await expect(results).toHaveCount(1)

    await searchInput.fill('zzz-nope')
    await expect(page.getByTestId('filter-empty-state')).toBeVisible()
    await expect(results).toHaveCount(0)

    await searchInput.fill('')
    await frontendToggle.click()
    await expect(frontendToggle).toHaveAttribute('aria-pressed', 'false')
    await expect(results).toHaveCount(5)
  })


  test('prev/next cancel out, today is marked in the grid, and clicking the active thumbnail again is a no-op', async ({ page }) => {
    const heading = page.getByTestId('calendar-heading')
    const startingHeading = await heading.textContent()

    await page.getByTestId('calendar-next').click()
    await page.getByTestId('calendar-prev').click()
    await expect(heading).toHaveText(startingHeading || 'text')

    const now = new Date()
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    await expect(page.getByTestId(`calendar-day-${todayIso}`)).toHaveClass(
      /widget-calendar__day--today/,
    )

    for (const id of ['hero', 'logo', 'react', 'vite']) {
      const thumb = page.getByTestId(`gallery-thumb-${id}`)
      await thumb.click()
      await expect(thumb).toHaveAttribute('aria-pressed', 'true')
    }

    const viteThumb = page.getByTestId('gallery-thumb-vite')
    await viteThumb.click()
    await expect(viteThumb).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('gallery-main-image')).toHaveAttribute('alt', 'Vite logo')
  })
})
