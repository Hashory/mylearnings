/**
 * 03_async_events.ts
 *
 * 【演習】非同期データ: 時間を扱う
 * 
 * 目標:
 * 1. `interval` を使って定期的に値を流す
 * 2. `take` を使って、指定回数で止める
 * 
 * 重要: 非同期のため、プログラムが終了しても裏で動こうとします。
 * 今回は take を使うことで自動的に止まるようにします。
 */

import { interval } from 'rxjs';
import { take } from 'rxjs/operators';

console.log('--- プログラム開始 ---');

// --- Q1. 500msごとに値を流すObservableを作ってください ---

// ヒント: interval(ミリ秒) を使います
// また、pipe(take(5)) をつなげて、5回だけで終わるようにしてください。
//
// const counter$ = interval(500).pipe(
//     take(5)
// );

// ↓ ここにコードを書いてください (const counter$ = ... )
const counter$ = interval(500).pipe(
  take(5)
)


console.log('--- 購読開始 ---');

// --- Q2. 購読して値を表示してください ---

// ヒント: counter$.subscribe(...)
//
// counter$.subscribe({
//     next: (val) => console.log(`Count: ${val}`),
//     complete: () => console.log('完了!')
// });

// ↓ ここにコードを書いてください
counter$.subscribe({
  next: (val) => console.log(`Count: ${val}`),
  complete: () => console.log("done~!")
})


console.log('--- プログラム末尾 (非同期なのでここが先に表示されます) ---');
