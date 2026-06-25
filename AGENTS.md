# Effector Board Layout — Codex (エグゼキューター)

## 役割定義

Codexはこのプロジェクトの **エグゼキューター（実装・実行）** として動作する。  
`specs/` ディレクトリにある仕様書（スペック）を読み、その内容を忠実に実装する。  
設計の変更・機能の追加はスペックの範囲内に留め、判断が必要な場合はスペックに立ち返ること。

---

## 実装フロー

### 1. スペックを読む

```
specs/SPEC-NNN-*.md
```

- 指定されたスペックファイルを必ず最初に読む
- 「変更対象ファイル」「実装要件」「受け入れ条件」をすべて把握してから実装を始める
- 不明点があれば実装を止め、スペックの記述に従う（憶測で実装しない）

### 2. 実装する（ループ制御あり）

スペックの「実装要件」に書かれた内容のみ実装する。  
**最大5回の試行ループ**で以下を繰り返す:

```
┌─ 試行 N（最大5回）─────────────────────────────┐
│ 1. 実装・修正を行う                              │
│ 2. npx tsc --noEmit でビルドエラーを確認          │
│ 3. スペックの受け入れ条件を満たしているか確認      │
│                                                  │
│  ✅ ビルドエラー0件 かつ 受け入れ条件を満たした     │
│     → ループ終了、手順3（完了処理）へ進む          │
│                                                  │
│  ❌ 条件未達 かつ 試行回数 < 5                    │
│     → 原因を特定して再試行                        │
└───────────────────────────────────────────────┘
```

**5回以内に解決しない場合はループを停止し、以下を報告する:**

```
## 実装停止レポート

### 試行回数
5 / 5

### 未解決の問題
- （エラーメッセージ・症状を具体的に）

### 原因の仮説
1. （仮説1）
2. （仮説2）

### 試みた対処
- （試行1でやったこと）
- （試行2でやったこと）
- ...

### 人間への確認事項
- （判断を仰ぎたい点）
```

その後、コミットは行わず作業を止める。

**共通ルール:**
- スペックに書かれていない機能・リファクタリング・改善は行わない
- 試行ごとに変更内容を記録しておく（レポートに使うため）

### 3. 完了処理

実装が終わったら以下を行う:

1. スペックファイルの `ステータス` を `[x]` にマークする
2. スペックファイルを `specs/done/` に移動する
3. `git add` → `git commit`（コミットメッセージ例: `feat: SPEC-NNN タイトル`）

---

## 技術コンテキスト

Expo Docsの正確なバージョン: https://docs.expo.dev/versions/v56.0.0/

### スタック
- React Native 0.85 + Expo SDK 56
- TypeScript (strict mode)
- AsyncStorage v3 — import: `import AsyncStorage from '@react-native-async-storage/async-storage'`
- react-native-svg — SVGは `<Svg>` + `<Line>/<Path>` 等で描画
- React Navigation v7 — NativeStack + BottomTabs
- PanResponder (RN core) — ドラッグ実装に使用（gesture-handlerは不使用）

### 座標系
- ボード上のエフェクター位置は **cm単位** で保存（ピクセルではない）
- 描画時のみ `scale = boardPixelWidth / board.width` でピクセルに変換
- `toCm(value, unit)` ヘルパーは `src/constants/presets.ts` にある

### 重要な型
```typescript
// src/types/index.ts
Board, PlacedEffector, MyEffector, Wiring, ResolvedPlacement
BoardMode = 'move' | 'wire' | 'delete'
JackSide = 'left' | 'right' | 'top' | 'bottom'
SizeUnit = 'cm' | 'inch'
```

### ストレージキー
- `@effector_boards` — Board[]
- `@my_effectors` — MyEffector[]

### ファイル構成
```
src/
  types/index.ts
  constants/presets.ts, colors.ts
  storage/boardStorage.ts, effectorStorage.ts
  hooks/useBoard.ts, useMyEffectors.ts
  components/Board.tsx, PlacedEffectorItem.tsx, AddEffectorModal.tsx
  screens/BoardScreen.tsx, MyEffectorsScreen.tsx, AddEditEffectorScreen.tsx
  navigation/AppNavigator.tsx
specs/            ← 未完了スペック
specs/done/       ← 完了済みスペック
```

---

## 制約

- スペックに記載のないファイルは変更しない
- コメントは「なぜ」が自明でない場合のみ、1行で書く
- `npm run android` でビルドが通ること（型エラーがないこと）を確認してからコミット
