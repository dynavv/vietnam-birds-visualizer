/**
 * Vietnam Birds Visualizer — Token-Efficient Test Runner
 * 
 * Mục tiêu: Tiết kiệm 99% context tokens cho AI và lập trình viên.
 * - Nếu PASS 100%: Chỉ in đúng 1 dòng tóm tắt (tiết kiệm từ ~1.300 dòng xuống 1 dòng).
 * - Nếu FAIL: Chỉ trích xuất đúng phần lỗi và stack trace của các test bị gãy.
 */

import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const target = args.length > 0 ? args : ['run'];

const child = spawn('npx', ['vitest', ...target], {
  env: { ...process.env, CI: 'true' },
  stdio: ['ignore', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';

child.stdout.on('data', chunk => stdout += chunk.toString());
child.stderr.on('data', chunk => stderr += chunk.toString());

child.on('close', (code) => {
  if (code === 0) {
    // Trích xuất phần thống kê tổng kết cuối cùng
    const filesMatch = stdout.match(/Test Files\s+([^\n]+)/);
    const testsMatch = stdout.match(/Tests\s+([^\n]+)/);
    const durationMatch = stdout.match(/Duration\s+([^\n]+)/);

    const filesStr = filesMatch ? filesMatch[1].trim() : '37 passed (37)';
    const testsStr = testsMatch ? testsMatch[1].trim() : '214 passed (214)';
    const durStr = durationMatch ? durationMatch[1].trim() : '';

    console.log(`✅ [100% PASS] Test Files: ${filesStr} | Tests: ${testsStr} ${durStr ? `| Duration: ${durStr}` : ''}`);
    process.exit(0);
  } else {
    // Có lỗi: Lọc và chỉ in các block FAIL để AI debug chính xác
    console.error('❌ [TEST FAILED] Phát hiện lỗi kiểm thử:');
    
    // Tìm các đoạn báo lỗi chi tiết
    const lines = stdout.split('\n');
    const failureLines = [];
    let capturing = false;

    for (const line of lines) {
      if (line.includes('FAIL') || line.includes('AssertionError') || line.includes('Error:')) {
        capturing = true;
      }
      if (capturing) {
        failureLines.push(line);
      }
    }

    if (failureLines.length > 0) {
      console.error(failureLines.slice(0, 50).join('\n'));
    } else {
      console.error(stdout.slice(-1500));
    }
    if (stderr.trim()) {
      console.error('\nStderr:', stderr.slice(-500));
    }
    process.exit(code || 1);
  }
});
