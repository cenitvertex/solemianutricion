const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    try {
        await page.goto('http://localhost:5173/');
        await page.waitForTimeout(2000);

        // Test the hero button (scroll to pricing)
        console.log("Found buttons:", await page.$$eval('button', els => els.length));

        console.log("Clicking scroll-to-pricing button...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const pricingBtn = btns.find(b => b.innerText.includes('Empezar Ahora'));
            if (pricingBtn) pricingBtn.click();
        });

        await page.waitForTimeout(1000); // wait for scroll behavior

        // Check if URL changed
        console.log("URL after Empezar Ahora click:", page.url());

        // Test open legal modal button
        console.log("Clicking Aviso de Privacidad...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const legalBtn = btns.find(b => b.innerText.includes('Aviso de Privacidad'));
            if (legalBtn) legalBtn.click();
        });

        await page.waitForTimeout(1000);
        const modalVisible = await page.$('.modal-content') !== null;
        console.log("Modal is visible after click?", modalVisible);

    } catch (e) {
        console.log('Error during script:', e);
    } finally {
        await browser.close();
    }
})();
