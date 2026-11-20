const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('=== FULL FLOW TEST ===');

  // 1. Login page
  console.log('\n1. Login page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.screenshot({ path: '/tmp/flow-1-login.png' });
  const title = await page.title();
  console.log(`   Title: ${title}`);

  // 2. Dashboard
  console.log('\n2. Dashboard...');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.screenshot({ path: '/tmp/flow-2-dashboard.png' });
  const dashText = await page.evaluate(() => document.body.innerText.substring(0, 200));
  console.log(`   Content: ${dashText.replace(/\n/g, ' | ').substring(0, 100)}`);

  // 3. Laporan list
  console.log('\n3. Laporan list...');
  await page.goto('http://localhost:5173/laporan', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.screenshot({ path: '/tmp/flow-3-laporan.png' });
  const laporanText = await page.evaluate(() => document.body.innerText.substring(0, 200));
  console.log(`   Content: ${laporanText.replace(/\n/g, ' | ').substring(0, 100)}`);

  // 4. Buat laporan page
  console.log('\n4. Buat laporan...');
  await page.goto('http://localhost:5173/laporan/baru', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.screenshot({ path: '/tmp/flow-4-create.png' });
  const createText = await page.evaluate(() => document.body.innerText.substring(0, 200));
  console.log(`   Content: ${createText.replace(/\n/g, ' | ').substring(0, 100)}`);

  // 5. Test API response
  console.log('\n5. API test...');
  const apiResponse = await page.evaluate(async () => {
    const res = await fetch('/api/dashboard/overview');
    return res.status;
  });
  console.log(`   Dashboard API: ${apiResponse}`);

  await browser.close();
  console.log('\n✅ All screenshots saved');
})();
