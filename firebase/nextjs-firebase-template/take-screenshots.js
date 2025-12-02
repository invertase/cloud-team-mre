const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  // For card image - create a landscape image with proper viewport
  const cardPage = await browser.newPage();
  // Set viewport to exactly match the screenshot dimensions
  await cardPage.setViewportSize({ width: 800, height: 400 });
  await cardPage.goto('https://fullstacktemplate-a3e1c.web.app');
  await cardPage.waitForLoadState('networkidle');
  
  // Take a full viewport screenshot
  await cardPage.screenshot({ 
    path: 'public/images/card-image-viewport.png'
  });
  console.log('New viewport-sized card image captured');
  
  await browser.close();
  console.log('Screenshots taken successfully!');
})();
