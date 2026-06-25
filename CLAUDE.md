# Effector Board Layout — Claude Code (プランナー)

## 役割定義

Claude Codeはこのプロジェクトの **プランナー（企画・設計）** として動作する。  
コードの実装は原則として行わず、**仕様書（スペック）を `specs/` ディレクトリに書く** ことで  
Codex（エグゼキューター）に実装を委任する。

### やること
- 機能要件・設計の整理と言語化
- `specs/SPEC-NNN-*.md` の作成・更新
- 型定義・インターフェースの設計
- 技術選定・アーキテクチャ判断
- `CLAUDE.md` の更新

### やらないこと
- `specs/` にある仕様の実装（Codexが担当）
- Codexが完了した `specs/done/` の内容の再実装

---

## スペックの書き方

### ファイル命名規則

```
specs/SPEC-NNN-kebab-case-name.md
```

例: `specs/SPEC-001-bezier-wiring.md`  
NNNは3桁の連番。完了後はCodexが `specs/done/` に移動する。

### スペックテンプレート

```markdown
# SPEC-NNN: タイトル

## ステータス
- [ ] 未着手  ← Codexが着手時に [ ] → [x] に変える

## 概要
何を・なぜ作るか（1〜3文）

## 変更対象ファイル
- `src/...` — 何をどう変えるか
- 新規ファイルが必要な場合はファイルパスと役割を記述

## 型定義・インターフェース変更
（変更がある場合のみ）

## 実装要件
番号付きリストで具体的な実装内容を記述。
曖昧さがないレベルまで細分化すること。

## 受け入れ条件
- [ ] 条件1
- [ ] 条件2

## 実装上の注意
- ハマりやすい箇所・制約・依存関係
```

---

## プロジェクト概要

エフェクターボードのエフェクター配置・配線を管理するReact Native（Expo）アプリ。

## 技術スタック

- **フレームワーク**: React Native + Expo (SDK 56)
- **言語**: TypeScript
- **ストレージ**: AsyncStorage (`@react-native-async-storage/async-storage`)
- **ナビゲーション**: React Navigation v7 (Bottom Tabs + NativeStack)
- **SVG描画**: react-native-svg（配線・グリッド描画）
- **対応プラットフォーム**: Android優先、iOS対応見据えた構成

## プロジェクト構造

```
src/
  types/index.ts            # 全TypeScript型定義
  constants/
    presets.ts              # エフェクターサイズプリセット・スケール定数
    colors.ts               # カラーパレット（エフェクター色・配線色・UIカラー）
  storage/
    boardStorage.ts         # ボードデータのAsyncStorage操作
    effectorStorage.ts      # マイエフェクターのAsyncStorage操作
  hooks/
    useBoard.ts             # ボード状態管理（配置・配線）
    useMyEffectors.ts       # マイエフェクター状態管理
  components/
    Board.tsx               # ボード本体（グリッド + エフェクター + 配線SVG）
    PlacedEffectorItem.tsx  # ドラッグ可能なエフェクターアイテム
    AddEffectorModal.tsx    # ボードへエフェクター追加モーダル
  screens/
    BoardScreen.tsx         # メインのボード画面
    MyEffectorsScreen.tsx   # マイエフェクター一覧・管理
    AddEditEffectorScreen.tsx # マイエフェクター追加・編集フォーム
  navigation/
    AppNavigator.tsx        # BottomTab ナビゲーター
specs/
  SPEC-NNN-*.md             # 未着手・作業中のスペック
  done/                     # 完了済みスペック
```

## 主要な型・データ構造

- **Board**: ボード設定（サイズcm/inch、配置エフェクター一覧、配線一覧）
- **PlacedEffector**: ボード上の配置情報（位置はボード単位: cm/inch）
- **MyEffector**: カスタムエフェクター（名前、サイズ、カテゴリ、色、画像、メモ、金額、ジャック位置）
- **Wiring**: 配線情報（接続元/先のplacementId、色）

## ボード座標系

- 位置はcm（またはinch）単位で保存（デバイス非依存）
- 描画時: `pixel = position_cm * scale (pixel/cm)`
- scaleは `(screenWidth - padding) / boardWidth` で計算

## 配線モード

現在の実装モード: `'move' | 'wire' | 'delete'`
- move: エフェクターをドラッグ移動
- wire: タップで接続元→接続先を選択して配線作成
- delete: タップで削除

## データ永続化

- ボード: AsyncStorage key `@effector_boards` (Board[] のJSON)
- マイエフェクター: AsyncStorage key `@my_effectors` (MyEffector[] のJSON)
- 配置・配線は常に自動保存（操作ごとに即時save）

## 開発コマンド

```bash
npm run android   # Expo Go で Android 実機確認
npm start         # Expo Dev Server 起動
npx tsc --noEmit  # 型チェック
```

## 今後の拡張ポイント（スペック候補）

- ジャック形状（ストレート/L型通常/L型コンパクト/ミニ）設定
- 配線のベジェ曲線表示（現在は直線）
- スナップ・グリッド吸着
- ボード複数管理（現在は1ボード固定）
- マイエフェクターへの画像添付
- ズームイン/アウト（現在は固定スケール）
