/**
 * 07_higher_order_mapping.ts
 *
 * 【演習】高階マッピング (switchMap)
 * 
 * シナリオ:
 * ユーザーIDが流れてきたら、そのIDを使ってAPIリクエスト(非同期)を行う、という処理を考えます。
 * RxJSでは「Observableの中でObservableを作る」ことになりますが、
 * これを「平坦化(flatten)」して使いやすくするのが `switchMap` などの演算子です。
 * 
 * switchMapの特徴:
 * 新しいデータが来たら、前の処理（API通信など）をキャンセルして、新しい処理に切り替えます。
 * 検索窓のオートコンプリートなどで必須のテクニックです。
 */

import { of, timer } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';

// 擬似的なAPI関数
// IDを受け取って、1秒後に「ユーザー名」を返す
const fetchUser = (id: number) => {
  console.log(`[API] ID:${id} Fetching...`);
  return timer(1000).pipe(
    map(() => `User_${id}`)
  );
};

console.log('--- switchMap の実験 ---');

// ユーザーIDが 1, 2, 3 と連続して入力されたとします
// (実際はキーボード入力イベントなど)
const input$ = of(1, 2, 3);

// --- Q1. switchMap を使って fetchUser を呼び出してください ---

// ヒント:
// input$.pipe(
//     switchMap(id => fetchUser(id))
// )
// .subscribe(result => console.log(`[Result] ${result}`));
//
// 期待される動作: ID:1, ID:2 の処理はキャンセルされ（または無視され）、
// 最後の ID:3 の結果だけ ("User_3") が表示されるはずです。
// (ただし of は一瞬で終わるので、timerがないと全部出ることもあります。
//  ここでは fetchUser が timer(1000) を使っているので、連続して呼ぶとキャンセル効果が見えます...
//  と言いたいところですが、ofは同期的なので一瞬で全部登録されてしまいます。
//  RxJSのswitchMapのキャンセルを見るには、入力自体も非同期(intervalなど)である必要がありますが、
//  まずここでは「受け取った値で別のObservableをreturnする」書き方を学びましょう)

// ↓ ここにコードを書いてください


