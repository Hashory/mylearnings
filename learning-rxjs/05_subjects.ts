/**
 * 05_subjects.ts
 *
 * 【演習】Subject: データを流す側になれる
 * 
 * 目標:
 * 1. `Subject` を作成する
 * 2. `subscribe` する (Observer A)
 * 3. `next` でデータを流す
 * 4. 後からもう一つ `subscribe` する (Observer B)
 * 5. さらにデータを流して、両方に届くことを確認する
 */

import { Subject } from 'rxjs';

console.log('--- Subjectの作成 ---');

// --- Q1. Subjectを作成してください ---

// ヒント: const subject = new Subject<string>();

// ↓ ここにコードを書いてください



// --- Q2. 購読者A (Observer A) を登録して、データ "Event 1" を流してください ---

// ヒント:
// subject.subscribe(v => console.log(`[A] ${v}`));
// subject.next('Event 1');

// ↓ ここにコードを書いてください



// --- Q3. 購読者B (Observer B) を登録して、その後 "Event 2" を流してください ---

console.log('--- 購読者B が参加 ---');

// ヒント:
// subject.subscribe(v => console.log(`[B] ${v}`));
// subject.next('Event 2');

// ↓ ここにコードを書いてください


