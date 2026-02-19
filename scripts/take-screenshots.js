const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'presentation', 'screenshots');

// Mobile viewport (iPhone 14)
const VIEWPORT = { width: 390, height: 844 };

const pages = [
    { name: '01-landing', url: '/', waitMs: 3000, scrollY: 0 },
    { name: '02-onboarding', url: '/onboarding', waitMs: 3000, scrollY: 0 },
    { name: '03-studio', url: '/studio', waitMs: 4000, scrollY: 0 },
    { name: '04-stylist', url: '/studio', waitMs: 4000, scrollY: 600 }, // scroll to show stylist area
    { name: '05-gallery', url: '/gallery', waitMs: 4000, scrollY: 0 },
    { name: '06-detail', url: '/gallery', waitMs: 4000, scrollY: 0, clickFirst: true },
    { name: '07-ranking', url: '/ranking', waitMs: 3000, scrollY: 0 },
    { name: '08-mypage', url: '/mypage', waitMs: 4000, scrollY: 0 },
];

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 2, // Retina quality
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    });

    for (const pageConfig of pages) {
        console.log(`📸 Capturing: ${pageConfig.name} (${BASE_URL}${pageConfig.url})`);

        const page = await context.newPage();

        try {
            await page.goto(`${BASE_URL}${pageConfig.url}`, {
                waitUntil: 'networkidle',
                timeout: 15000
            });

            // Wait for content to load
            await sleep(pageConfig.waitMs);

            // Scroll if needed
            if (pageConfig.scrollY > 0) {
                await page.evaluate((y) => window.scrollTo(0, y), pageConfig.scrollY);
                await sleep(500);
            }

            // Click first card if needed (for detail page)
            if (pageConfig.clickFirst) {
                try {
                    // Try to click on first design card
                    const card = await page.$('a[href^="/design/"]');
                    if (card) {
                        await card.click();
                        await sleep(2000);
                        console.log(`  → Navigated to design detail page`);
                    } else {
                        console.log(`  → No design card found, skipping click`);
                    }
                } catch (e) {
                    console.log(`  → Click failed: ${e.message}`);
                }
            }

            const outputPath = path.join(OUTPUT_DIR, `${pageConfig.name}.png`);
            await page.screenshot({
                path: outputPath,
                fullPage: false, // viewport only (mobile frame)
                type: 'png'
            });

            console.log(`  ✅ Saved: ${outputPath}`);
        } catch (error) {
            console.log(`  ❌ Failed: ${error.message}`);
        } finally {
            await page.close();
        }
    }

    await browser.close();
    console.log('\n🎉 All screenshots captured!');
})();
