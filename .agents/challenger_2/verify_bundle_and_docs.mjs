import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

console.log('=== EMPIRICAL VERIFICATION HARNESS — CHALLENGER 2 ===\n');

let allPassed = true;

// 1. Check dist/assets bundle chunks
console.log('1. Checking compiled bundle sizes in dist/assets:');
const distAssetsDir = path.join(projectRoot, 'dist/assets');

if (!fs.existsSync(distAssetsDir)) {
  console.error('FAIL: dist/assets does not exist. Run npm run build first.');
  allPassed = false;
} else {
  const files = fs.readdirSync(distAssetsDir);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));

  console.log(`Found ${jsFiles.length} JS chunks and ${cssFiles.length} CSS files:`);

  let maxChunkSize = 0;
  let maxChunkName = '';

  for (const jsFile of jsFiles) {
    const filePath = path.join(distAssetsDir, jsFile);
    const stat = fs.statSync(filePath);
    const sizeKb = stat.size / 1024;
    if (sizeKb > maxChunkSize) {
      maxChunkSize = sizeKb;
      maxChunkName = jsFile;
    }
    const status = sizeKb < 500 ? 'PASS' : 'FAIL (>500 kB)';
    console.log(`  - [${status}] ${jsFile.padEnd(35)} : ${sizeKb.toFixed(2)} kB`);
    if (sizeKb >= 500) {
      allPassed = false;
    }
  }

  console.log(`\nMax chunk: ${maxChunkName} at ${maxChunkSize.toFixed(2)} kB (Goal: <500 kB)`);

  const requiredChunks = [
    'vendor-react',
    'vendor-leaflet',
    'vendor-d3',
    'vendor-icons',
    'data-species',
    'index'
  ];

  for (const rc of requiredChunks) {
    const found = jsFiles.some(f => f.startsWith(rc));
    if (found) {
      console.log(`  - [PASS] Required chunk found: ${rc}`);
    } else {
      console.error(`  - [FAIL] Missing required chunk: ${rc}`);
      allPassed = false;
    }
  }
}

// 2. Check docs/AUDIT_AND_ROADMAP.md completeness
console.log('\n2. Checking docs/AUDIT_AND_ROADMAP.md completeness:');
const docPath = path.join(projectRoot, 'docs/AUDIT_AND_ROADMAP.md');

if (!fs.existsSync(docPath)) {
  console.error('FAIL: docs/AUDIT_AND_ROADMAP.md does not exist.');
  allPassed = false;
} else {
  const docContent = fs.readFileSync(docPath, 'utf-8');
  const requiredSections = [
    '1. TỔNG QUAN DỰ ÁN (EXECUTIVE SUMMARY)',
    '2. PHÂN LOẠI & KẾT QUẢ XỬ LÝ LỖ HỔNG (FINDINGS & RESOLUTIONS)',
    'MỨC ĐỘ P0 — LỖ HỔNG CỐT LÕI (CRITICAL DEFECTS)',
    'MỨC ĐỘ P1 — TƯƠNG TÁC & HIỂN THỊ (HIGH IMPACT DEFECTS)',
    'MỨC ĐỘ P2 — TỐI ƯU HÓA TÀI NGUYÊN & KIỂU DỮ LIỆU',
    'MỨC ĐỘ P3 — KIỂM THỬ TỰ ĐỘNG & BẢO HÀNH',
    '3. BẢNG SO SÁNH TRƯỚC VÀ SAU KIỂM TOÁN',
    '4. LỘ TRÌNH PHÁT TRIỂN TIẾP THEO (FUTURE ROADMAP)',
    'Giai đoạn 1',
    'Giai đoạn 2',
    'Giai đoạn 3'
  ];

  for (const sec of requiredSections) {
    if (docContent.includes(sec)) {
      console.log(`  - [PASS] Section found: "${sec}"`);
    } else {
      console.error(`  - [FAIL] Missing section: "${sec}"`);
      allPassed = false;
    }
  }

  const lineCount = docContent.split('\n').length;
  console.log(`Total lines in documentation: ${lineCount}`);
  if (lineCount < 50) {
    console.error('FAIL: Documentation is too brief.');
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('\nOVERALL VERDICT: FAIL');
  process.exit(1);
} else {
  console.log('\nOVERALL VERDICT: ALL EMPIRICAL CHECKS PASSED SUCCESSFULLY!');
  process.exit(0);
}
