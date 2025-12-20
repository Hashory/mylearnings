/**
 * 01_hello_observable.ts
 *
 * 【演習】RxJSの基本: Observable (観測可能なもの) を作ってみよう
 * 
 * 目標:
 * 1. `new Observable` を使って、独自のデータストリームを作る
 * 2. `subscribe` を使って、そのデータを受け取る
 * 
 * ヒント:
 * Observableは「関数の引数にコールバック(subscriber)を持つ」ようなイメージです。
 * subscriber.next(値) でデータを送り、subscriber.complete() で終了します。
 */

import { Observable } from 'rxjs';

// --- Q1. 手動でObservableを作成してください ---

// ヒント: 以下のコードを書いてみましょう
// const myObservable = new Observable<string>((subscriber) => {
//     subscriber.next('Hello');
//     subscriber.next('RxJS');
//     subscriber.complete();
// });

// ↓ ここにコードを書いてください (const myObservable = ... )
const myObservable = new Observable<string>((subscriber) => {
  subscriber.next("Hello");
  subscriber.next("RxJS");
  subscriber.complete();
});



// --- Q2. 作成したObservableを購読(subscribe)して表示してください ---

console.log('--- 1. 購読開始 ---');

// ヒント: myObservable.subscribe(...) を呼びます。
// 引数にはオブジェクトを渡し、next, error, complete それぞれの処理を書きます。
// myObservable.subscribe({
//     next: (value) => console.log(`受信: ${value}`),
//     complete: () => console.log('完了'),
// });

// ↓ ここにコードを書いてください
myObservable.subscribe({
  next: (value) => console.log(`受信: ${value}`),
  complete: () => console.log('完了'),
})


console.log('--- 1. 購読終了 ---\n');


// --- Q3. 'of' を使って簡単にObservableを作ってください ---

import { of } from 'rxjs'; // ofをインポート

console.log('--- 2. "of" を使った作成 ---');

// ヒント: of(1, 2, 3) のように書くだけでObservableになります。
// const simpleObservable = of(1, 2, 3, 4, 5);

// ↓ ここにコードを書いてください (const simpleObservable = ... )
const simpleObservable = of(1, 2, 3, 4, 5);


// ヒント: simpleObservable.subscribe(value => console.log(value));

// ↓ ここにコードを書いてください
simpleObservable.subscribe({
  next: (value) => console.log(`受信: ${value}`),
  complete: () => console.log('完了'),
});


