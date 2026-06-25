# Effector Board Layout

エフェクターボードのエフェクター配置・配線を管理するReact Native（Expo）アプリ。

## 技術スタック

- **フレームワーク**: React Native + Expo (SDK 56)
- **言語**: TypeScript
- **ストレージ**: AsyncStorage (`@react-native-async-storage/async-storage`)
- **ナビゲーション**: React Navigation v7 (Bottom Tabs)
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

## ジャック位置

- `JackSide`: left / right / top / bottom
- `JackConfig.position`: 0.0〜1.0（辺に沿った相対位置）
- 配線のSVG座標はジャック位置から計算

## 配線モード

現在の実装モード: `'move' | 'wire' | 'delete'`
- move: エフェクターをドラッグ移動
- wire: タップで接続元→接続先を選択して配線作成
- delete: タップで削除

## エフェクターサイズプリセット

`src/constants/presets.ts` の `EFFECTOR_PRESETS` に定義:
- MXR Mサイズ、MXR Sサイズ
- Boss コンパクト
- Strymon ラージ
- TC Mini
- Eventide H9

## データ永続化

- ボード: AsyncStorage key `@effector_boards` (Board[] のJSON)
- マイエフェクター: AsyncStorage key `@my_effectors` (MyEffector[] のJSON)
- 配置・配線は常に自動保存（操作ごとに即時save）

## 開発コマンド

```bash
npm run android   # Expo Go で Android 実機確認
npm run ios       # Expo Go で iOS 実機確認（将来対応）
npm start         # Expo Dev Server 起動
```

## 今後の拡張ポイント（v2以降）

- [ ] ジャック形状（ストレート/L型通常/L型コンパクト/ミニ）設定
- [ ] 配線のベジェ曲線表示（現在は直線）
- [ ] スナップ・グリッド吸着
- [ ] ボード複数管理（現在は1ボード固定）
- [ ] マイエフェクターへの画像添付
- [ ] ズームイン/アウト（現在は固定スケール）
- [ ] ボードサイズ変更（現在は60cm × 30cm固定から変更可）
