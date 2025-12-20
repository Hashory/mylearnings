/**
 * 02_transformers.ts
 *
 * 【演習】データの加工: map と filter
 * 
 * 目標:
 * 1. `pipe` メソッドを使ってオペレーターをつなげる
 * 2. `filter` で偶数だけに通す
 * 3. `map` で値を10倍にする
 */

import { of } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';

// --- データの準備 ---
const numbers$ = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

console.log('--- データを加工して表示 ---');

// --- Q1. pipe() を使ってデータを加工してください ---

// ヒント: numbers$.pipe(...) の中にオペレーターをカンマ区切りで並べます。
// 
// numbers$.pipe(
//     // 1. 各値のログを出す (tapを使うと便利)
//     // tap(n => console.log(`Flow: ${n}`)),
//
//     // 2. 偶数だけ残す (filterを使う: n % 2 === 0 がtrueのものだけ通る)
//     // filter(n => n % 2 === 0),
//
//     // 3. 値を10倍にする (mapを使う)
//     // map(n => n * 10)
// )
// .subscribe(val => console.log(`Result: ${val}`));

// ↓ ここにコードを書いてください ("numbers$.pipe(" から始めてみましょう)
numbers$.pipe(
  tap(n => console.log(`Flow: ${n}`)),
  filter(m => m % 2 === 0),
  map(n => n * 10)
)
  .subscribe(val => console.log(`Result: ${val}`));

