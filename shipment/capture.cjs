// Playwright screenshot capture for the user manual.
// Logs in, then visits each page and saves a PNG into ./screenshots/
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:8000';
const EMAIL = 'admin@shipments.local';
const PASSWORD = '123456789';
const OUT = __dirname + '/screenshots';

const shots = []; // {name, ok, note}

async function snap(page, name, note = '') {
  try {
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    shots.push({ name, ok: true, note });
    console.log('  ✓', name);
  } catch (e) {
    shots.push({ name, ok: false, note: e.message });
    console.log('  ✗', name, e.message);
  }
}

async function go(page, path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
    locale: 'ar',
  });
  const page = await ctx.newPage();

  // 1) Login page (before authenticating)
  await go(page, '/login');
  await snap(page, '01-login', 'صفحة تسجيل الدخول');

  // Perform login
  await page.fill('input[name="email"]', EMAIL).catch(() => {});
  await page.fill('input[name="password"]', PASSWORD).catch(() => {});
  await Promise.all([
    page.waitForLoadState('networkidle').catch(() => {}),
    page.click('button[type="submit"]').catch(() => {}),
  ]);
  await page.waitForTimeout(1500);
  console.log('After login URL:', page.url());

  // 2) Dashboard
  await go(page, '/dashboard');
  await snap(page, '02-dashboard', 'لوحة التحكم');

  // 3) Sea shipments
  await go(page, '/shipments');
  await snap(page, '05-shipments-index', 'قائمة الشحن البحري');

  // capture first-row tracking & edit links for dynamic pages
  let trackHref = null, editHref = null, showHref = null;
  trackHref = await page.getAttribute('a[href*="/tracking"]', 'href').catch(() => null);
  editHref = await page.getAttribute('a[href*="/edit"]', 'href').catch(() => null);

  await go(page, '/shipments/create');
  await snap(page, '05-shipments-create', 'نموذج إضافة شحنة بحرية');

  if (editHref) {
    await go(page, editHref.replace(BASE, ''));
    await snap(page, '05-shipments-edit', 'تعديل شحنة بحرية');
  }
  if (trackHref) {
    await go(page, trackHref.replace(BASE, ''));
    await snap(page, '06-shipment-tracking', 'تتبّع الشحنة البحرية');
    // tracking create
    const tcreate = await page.getAttribute('a[href*="/tracking/create"]', 'href').catch(() => null);
    if (tcreate) {
      await go(page, tcreate.replace(BASE, ''));
      await snap(page, '06-tracking-create', 'إضافة سجل تتبّع');
    }
  }

  // 4) Land/road shipments
  await go(page, '/road-shipments');
  await snap(page, '07-road-index', 'قائمة الشحن البري');
  await go(page, '/road-shipments/create');
  await snap(page, '07-road-create', 'إضافة شحنة برية');

  // 5) Local shipments
  await go(page, '/local-shipments');
  await snap(page, '09-local-index', 'قائمة الشحن المحلي');
  await go(page, '/local-shipments/create');
  await snap(page, '09-local-create', 'إضافة شحنة محلية');

  // 6) Customs data
  await go(page, '/customs-data');
  await snap(page, '10-customs-index', 'البيانات الجمركية');
  await go(page, '/customs-data/create');
  await snap(page, '10-customs-create', 'إضافة بيان جمركي');

  // 7) Reports
  await go(page, '/admin/reports');
  await snap(page, '11-reports-index', 'صفحة التقارير');
  await go(page, '/admin/reports/shipments');
  await snap(page, '11-report-shipments', 'تقرير الشحنات بحر/جو');

  // 8) Users / roles / permissions
  await go(page, '/admin/users');
  await snap(page, '12-users-index', 'إدارة المستخدمين');
  await go(page, '/admin/users/create');
  await snap(page, '12-users-create', 'إضافة مستخدم');
  await go(page, '/admin/roles');
  await snap(page, '12-roles-index', 'إدارة الأدوار');
  await go(page, '/admin/roles/create');
  await snap(page, '12-roles-create', 'إضافة دور');

  // 9) Master data examples
  await go(page, '/admin/shipment-stages');
  await snap(page, '13-stages-index', 'مراحل الشحن');
  await go(page, '/admin/shipment-stages/create');
  await snap(page, '13-stages-create', 'إضافة مرحلة شحن');
  await go(page, '/admin/warehouses');
  await snap(page, '13-warehouses-index', 'المخازن');

  // 10) Site settings
  await go(page, '/admin/site-settings');
  await snap(page, '14-site-settings', 'إعدادات النظام');

  // 11) Profile
  await go(page, '/profile');
  await snap(page, '15-profile', 'الملف الشخصي');

  await browser.close();

  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(shots, null, 0));
  const ok = shots.filter(s => s.ok).length;
  console.log(`\n${ok}/${shots.length} screenshots captured.`);
})();
