# Phase 2: Controls - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

ユーザーがセッションコンテキストを設定できるようにする：キャラクター管理（追加・選択・削除）、Day/時刻管理（Day増減・スライダー・微調整）、データリセット。マップとプロット機能はPhase 3。

</domain>

<decisions>
## Implementation Decisions

### 画面レイアウト

- **D-01:** コントロール群は上部に横並び配置（1〜2行のツールバー的レイアウト）。マップ表示領域を最大化する
- **D-02:** コントロール群は折りたたみ可能。マダミスプレイ中にマップを広く見たい時に畳める
- **D-03:** リセットボタンはコントロール群の端に小さく配置。誤操作防止のため目立たせない
- **D-04:** 「Plotted.」タイトルは削除してスペースを確保。アプリだと分かれば不要

### キャラクターのカラー指定

- **D-05:** プリセットパレット（12色）+ 自由入力（カラーピッカーまたはHEXコード）の併用
- **D-06:** 同じ色を複数キャラクターに使用可能（制限しない）
- **D-07:** キャラクターの最大人数に制限なし

### キャラクターチップのデザイン

- **D-08:** カラー背景のバッジ型チップ。チップ全体がキャラカラーで塗られ、白文字で名前表示
- **D-09:** アクティブ状態はサイズ拡大+影で表現。選択中のチップが少し大きくなり影がつく
- **D-10:** キャラクター追加フォームはチップ列の下に常時表示。名前入力とカラー選択が常に見えている
- **D-11:** キャラクター削除はチップ上のホバーで「×」表示。クリックで即削除（確認ダイアログなし）

### Day選択

- **D-12:** タブ風の横並びボタン。`[Day1] [Day2] [Day3]` のように並び、+/-ボタンでDay数を増減
- **D-13:** Day選択と時刻コントロールは2段構成。上段にDay選択、下段に時刻スライダー+微調整ボタン

### 時刻コントロール

- **D-14:** スライダー + 目盛り付き。0時、6時、12時、18時などの目盛りラベルを表示
- **D-15:** 微調整ボタン（-10m / -5m / +5m / +10m）はスライダーの下に横並び配置

### Claude's Discretion

- プリセット12色の具体的なカラー値（マップ上での視認性を考慮）
- カラーピッカーのUI実装方式（ブラウザネイティブ or カスタム）
- 折りたたみのアニメーションとトリガーUI
- Day選択タブのアクティブ状態のスタイリング
- スライダーの目盛り数と間隔の詳細
- 時刻表示のフォント（PROJECT.mdでserif体と定義済み）
- reducerのアクション設計とディスパッチ構造

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<canonical_refs>

## Canonical References

### 要件定義

- `.planning/REQUIREMENTS.md` §Character — CHAR-01〜CHAR-03の詳細要件
- `.planning/REQUIREMENTS.md` §Time — TIME-01〜TIME-04の詳細要件
- `.planning/REQUIREMENTS.md` §Data — DATA-01のリセット要件

### データ構造・デザイン

- `.planning/PROJECT.md` §Design > データ構造 — State型定義（chars, days, activeChar, activeDay, currentTime）
- `.planning/PROJECT.md` §Design — カラーテーマ、タイポグラフィ（時刻表示はserif体）、UIルール（角丸、ボーダー）

### 先行フェーズの決定

- `.planning/phases/01-foundation/1-CONTEXT.md` — D-01（ヘッダーなし）、D-04〜D-07（永続化戦略）、D-08〜D-11（テーマ適用方針）

### 制約

- `.planning/STATE.md` §Blockers/Concerns — shadcn Sliderと@base-ui/reactの互換性確認が必要

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/shared/ui/Button` — default/outline/ghost/destructive等のバリアント。Day±、時刻微調整、リセット、キャラ削除に使用
- `src/shared/ui/Input` — テキスト入力。キャラ名入力（maxLength=10）に使用
- `src/shared/ui/Field` — FieldSet/FieldGroup/FieldLabel/FieldContent等の複合コンポーネント。キャラ追加フォーム構築に使用
- `src/shared/ui/Item` — ItemGroup/ItemContent/ItemActions等。キャラクターリスト表示に使用
- `src/shared/lib/utils.ts` — `cn()`ユーティリティ（clsx + tailwind-merge）

### Established Patterns

- `useReducer` + localStorage自動永続化パターン（`src/shared/model/`）。現在はRESETアクションのみ — Phase 2で大幅拡張
- `ts-pattern`が依存にあり、reducerのパターンマッチングに使用可能
- `@base-ui/react` v1.3.0 — Sliderコンポーネントが利用可能（shadcn Sliderの代替候補）
- CVA (class-variance-authority) によるコンポーネントバリアント管理

### Integration Points

- `src/shared/model/reducer.ts` — reducerにキャラ/Day/時刻/リセットのアクションを追加
- `src/shared/model/use-app-state.ts` — useAppStateフックからdispatchを取得してUIから操作
- `src/pages/home/ui/PlottedApp.tsx` — 現在は空ページ。ここにコントロール群を配置
- `src/app/styles/index.css` — ノワールテーマのCSS変数（`--color-accent-dark`等）が定義済み

</code_context>

<deferred>
## Deferred Ideas

- カラーパレットのプリセット（UX-01） — v2 Requirements
- キーボード矢印キーによる時刻操作（UX-02） — v2 Requirements

</deferred>

---

_Phase: 02-controls_
_Context gathered: 2026-03-22_
