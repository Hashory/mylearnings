/**
 * 04_subscription_management.ts
 *
 * 【演習】購読の解除 (Unsubscribe)
 * 
 * 目標:
 * 1. 終わりのないObservable (interval) を購読する
 * 2. `subscription` オブジェクトを変数に受け取る
 * 3. 一定時間後に `subscription.unsubscribe()` を呼んで止める
 */

import { interval, Subscription } from 'rxjs';

console.log('--- タイマー開始 ---');

const counter$ = interval(500); // 0.5秒ごとに発火

// --- Q1. 購読を開始し、Subscriptionオブジェクトを受け取ってください ---

let subscription: Subscription;

// ヒント:
// subscription = counter$.subscribe(val => {
//     console.log(`[Timer] ${val}`);
// });

// ↓ ここにコードを書いてください (subscription = ... )
subscription = counter$.subscribe(val => {
  console.log(`[Timer]: ${val}`)
}
)


// --- Q2. 3.5秒後に購読を解除(unsubscribe)してください ---

setTimeout(() => {
  console.log('--- 3.5秒経過: 購読を解除します ---');

  // ヒント:
  // if (subscription) {
  //     subscription.unsubscribe();
  // }

  // ↓ ここにコードを書いてください
  if (subscription) {
    subscription.unsubscribe();
  }

  console.log('--- 解除完了 ---');
}, 3500);
