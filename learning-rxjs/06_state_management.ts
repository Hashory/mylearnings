/**
 * 06_state_management.ts
 *
 * 【演習】BehaviorSubject: 現在の値を保持する
 * 
 * 目標:
 * 1. 初期値を持つ `BehaviorSubject` を作成する
 * 2. 購読すると「即座に」初期値（または最新値）が来ることを確認する
 * 3. `value` プロパティで直接値を取り出す
 */

import { BehaviorSubject } from 'rxjs';

console.log('--- BehaviorSubject ---');

// --- Q1. 初期値 "Initial" を持つ BehaviorSubject を作成してください ---

// ヒント: const state$ = new BehaviorSubject<string>('Initial');

// ↓ ここにコードを書いてください



// --- Q2. 購読者Aを登録してください。登録直後に値が表示されるはずです ---

// ヒント: state$.subscribe(v => console.log(`[A] ${v}`));

// ↓ ここにコードを書いてください (実行して "Initial" が出るか確認)



// --- Q3. 値を "Updated" に更新し、その時点での現在値を `.value` で取得してください ---

console.log('-> 更新します');

// ヒント:
// state$.next('Updated');
// console.log(`現在の値: ${state$.value}`);

// ↓ ここにコードを書いてください


