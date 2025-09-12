import { expect, test } from '@playwright/test';

test.describe('Monorepo Setup E2E', () => {
  test('should have development environment running', async ({ page }) => {
    // 개발 서버가 실행 중인지 확인
    await page.goto('/');
    
    // 기본 페이지가 로드되는지 확인
    await expect(page).toHaveTitle(/Mini Notion App/i);
    
    // 개발 중 메시지가 표시되는지 확인
    await expect(page.locator('h1')).toContainText('Mini Notion App');
    await expect(page.locator('p')).toContainText('실시간 협업 에디터 - 개발 중');
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // 기본 메타 태그들이 설정되어 있는지 확인
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Viewport meta tag 확인 (모바일 대응)
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportMeta).toContain('width=device-width');
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');
    
    // 데스크톱 뷰
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('h1')).toBeVisible();
    
    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
    
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle navigation', async ({ page }) => {
    await page.goto('/');
    
    // 페이지가 정상적으로 로드되는지 확인
    await expect(page).toHaveURL('/');
    
    // 404 페이지 처리 확인
    const response = await page.goto('/non-existent-page');
    expect(response?.status()).toBe(404);
  });
});