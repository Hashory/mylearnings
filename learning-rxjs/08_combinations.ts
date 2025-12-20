/**
 * 08_combinations.ts
 *
 * 【演習】複数のObservableを合成する (combineLatest)
 * 
 * シナリオ:
 * フォームに「名前」と「年齢」の入力欄があり、両方が入力されたら
 * リアルタイムで「プロフィール」を表示したいとします。
 * `combineLatest` は、登録したObservableのいずれかが更新されるたびに、
 * それぞれの「最新の値」を配列でまとめて送出してくれます。
 */

import { combineLatest, BehaviorSubject } from 'rxjs';

// 名前と年齢の入力状態（初期値あり）
const name$ = new BehaviorSubject<string>('Alice');
const age$ = new BehaviorSubject<number>(25);

console.log('--- combineLatest の実験 ---');

// --- Q1. combineLatest を使って両方の最新値を受け取ってください ---

// ヒント:
// combineLatest([name$, age$]).subscribe(([name, age]) => {
//     console.log(`Profile: ${name} (${age})`);
// });

// ↓ ここにコードを書いてください
combineLatest([name$, age$])
  .subscribe(([name$, age$]) => {
    console.log(`Profile: ${name$} (${age$})`)
  })


// --- Q2. 名前だけ変更してみてください ---

console.log('-> 名前を Bob に変更');
// ヒント: name$.next('Bob');

// ↓ ここにコードを書いてください
name$.next("Bob")


// --- Q3. 年齢だけ変更してみてください ---

console.log('-> 年齢を 30 に変更');
// ヒント: age$.next(30);

// ↓ ここにコードを書いてください
age$.next(30)
// 結果として、どちらか片方を変えるだけで、両方の最新セットがログに出るはずです。
