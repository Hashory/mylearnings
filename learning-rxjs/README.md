# RxJS ハンズオンチュートリアル

> [!IMPORTANT]
> Antigravityを利用して作成されました。

これは、手を動かしながら **RxJS** (Reactive Extensions for JavaScript) を学ぶための自習用教材です。
コードの中に用意された「演習問題（Q）」を解いていくことで、RxJSの重要な概念をステップバイステップで理解できるように構成されています。

## 特徴
- **穴埋め形式**: 各ファイルには問題と、ほぼ答えに近い「ヒント」が書かれています。ヒントを参考にコードを書くことで、書き方を自然に覚えられます。
- **実行可能**: TypeScriptで書かれており、すぐに実行して結果を確認できます。
- **幅広いトピック**: 基礎的な `Observable` の作成から、実務で必須の `switchMap` や `combineLatest` までカバーしています。

## 使い方

1. ファイルを順番に開きます（`01_hello_observable.ts` からスタート）。
2. コメントに書かれた目標と解説を読みます。
3. `// ↓ ここにコードを書いてください` という部分に、ヒントを参考にコードを記述します。
4. ターミナルで以下のコマンドを実行して、動作を確認します。

```bash
# 例: 01番を実行する場合
pnpx ts-node 01_hello_observable.ts
```

## カリキュラム一覧

| ファイル名 | 学ぶ内容 | キーワード |
|---|---|---|
| `01_hello_observable.ts` | **基本** | Observable, subscribe, of |
| `02_transformers.ts` | **データの加工** | pipe, map, filter |
| `03_async_events.ts` | **非同期と時間** | interval, timer, take |
| `04_subscription_management.ts` | **購読の管理** | Subscription, unsubscribe, メモリリーク防止 |
| `05_subjects.ts` | **マルチキャスト** | Subject (イベントバス的な使い方) |
| `06_state_management.ts` | **状態管理** | BehaviorSubject (現在の値を保持する) |
| `07_higher_order_mapping.ts` | **高階マッピング** | switchMap (非同期処理の切り替え・平坦化) |
| `08_combinations.ts` | **ストリームの合成** | combineLatest (複数の最新値をまとめる) |

## 前提環境
- Node.js がインストールされていること
- パッケージのインストール: `pnpm install` (または npm install)

それでは、`01_hello_observable.ts` から始めてみましょう！
