import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/playground')
})

test('navigating and selecting a date in the calendar, then confirming the modal', async ({ page }) => {
  const heading = page.getByTestId('calendar-heading')
  await expect(page.getByTestId('playground-section-calendar')).toBeVisible()
  await expect(heading).toHaveText(/^[A-Za-z]+ \d{4}$/)
  const initial = (await heading.textContent()) ?? ''
  await page.getByTestId('calendar-next').click()
  await page.getByTestId('calendar-next').click()
  await expect(heading).not.toHaveText(initial)
  const day = page.locator('[data-testid^="calendar-day-"]').first()
  const iso = (await day.getAttribute('data-testid') ?? '').replace('calendar-day-', '')
  await day.click()
  await expect(page.getByTestId('calendar-selected-date')).toHaveText(`Selected: ${iso}`)
  await page.getByTestId('modal-open-button').click()
  await expect(page.getByTestId('modal-dialog')).toBeVisible()
  await page.getByTestId('modal-confirm-button').click()
  await expect(page.getByTestId('modal-dialog')).toBeHidden()
  await expect(page.getByTestId('modal-result')).toHaveText('Last action: confirmed')
})

test('combining a category toggle with a search query narrows and resets the results', async ({ page }) => {
  const frontend = page.getByTestId('filter-category-frontend')
  const search = page.getByTestId('filter-search-input')
  const results = page.getByTestId('filter-results-list').locator('li')
  await expect(page.getByTestId('playground-section-filter')).toBeVisible()
  await frontend.click()
  await expect(frontend).toHaveAttribute('aria-pressed', 'true')
  await expect(results).toHaveCount(2)
  await expect(page.getByTestId('filter-result-p1')).toBeVisible()
  await expect(page.getByTestId('filter-result-p5')).toBeVisible()
  await search.fill('board')
  await expect(results).toHaveCount(1)
  await search.fill('zzz-nope')
  await expect(page.getByTestId('filter-empty-state')).toBeVisible()
  await expect(results).toHaveCount(0)
  await search.clear()
  await frontend.click()
  await expect(frontend).toHaveAttribute('aria-pressed', 'false')
  await expect(results).toHaveCount(5)
})

test('prev/next cancel out, today is marked in the grid, and clicking the active thumbnail again is a no-op', async ({ page }) => {
  const heading = page.getByTestId('calendar-heading')
  const initial = (await heading.textContent()) ?? ''
  await page.getByTestId('calendar-next').click()
  await page.getByTestId('calendar-prev').click()
  await expect(heading).toHaveText(initial)
  const iso = new Date().toISOString().slice(0, 10)
  await expect(page.getByTestId(`calendar-day-${iso}`)).toHaveClass(/widget-calendar__day--today/)
  for (const id of ['hero', 'logo', 'react', 'vite']) {
    await page.getByTestId(`gallery-thumb-${id}`).click()
    await expect(page.getByTestId(`gallery-thumb-${id}`)).toHaveAttribute('aria-pressed', 'true')
  }
  await page.getByTestId('gallery-thumb-vite').click()
  await expect(page.getByTestId('gallery-thumb-vite')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('gallery-main-image')).toHaveAttribute('alt', 'Vite logo')
})
