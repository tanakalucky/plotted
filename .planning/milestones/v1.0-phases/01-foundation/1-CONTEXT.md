# Phase 1: Foundation - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

既存のTodo/Convex/Clerkコードを全て削除し、useReducerによる状態モデル、localStorage + IndexedDBの永続化レイヤー、クラシック・ノワールのデザインテーマを構築する。アプリがクリーンにビルド・起動する状態にする。

</domain>

<decisions>
## Implementation Decisions

### クリーンアップ後の初期画面

- **D-01:** タイトル「Plotted.」を左上に小さく配置したミニマルな空ページ。ヘッダーバーは作らない（PROJECT.mdの「ヘッダーなし」ルールに従う）
- **D-02:** タイトルはsans-serif（UI全般と同じシステムフォント）で表示
- **D-03:** `wouter`は削除し、1コンポーネントを直接レンダリングする（SPAで1ページのみ）

### localStorage破損時の回復戦略

- **D-04:** 破損データ（JSONパースエラー、スキーマ不一致）はサイレントリセット — ユーザー通知なしで初期状態で起動
- **D-05:** バリデーションは最低限 — JSONパース成功 + トップレベルキー（`chars`, `maps`, `logs`, `days`等）の存在チェックのみ。Valibotによる厳密な値域検証はしない
- **D-06:** IndexedDBアクセス不可時はマップ画像なしで起動（他の機能は使える）
- **D-07:** データマイグレーション機構は不要。v1完成までデータ構造は変えない前提。変わったらリセットで対応

### テーマ適用範囲

- **D-08:** Phase 1でページ全体にノワールテーマを適用する（背景色: 羊皮紙ベージュ、テキスト色: ダークブラウンが効いている状態）
- **D-09:** shadcn/uiコンポーネントもPhase 1でテーマカスタマイズする。CSS変数をshadcnの変数体系にマッピングし、全コンポーネントがノワールテーマで表示される状態にする
- **D-10:** Tailwind CSS v4の`@theme`ディレクティブでセマンティックなトークン名を定義する（例: `--color-bg`, `--color-surface` → `bg-bg`, `text-ink-dark`として使用可能）
- **D-11:** ダークモードは対応しない。`next-themes`は削除。ノワールテーマ1本のみ

### Claude's Discretion

- shadcn/ui CSS変数マッピングの具体的な変数名設計
- `@theme`のトークン命名の詳細（セマンティック名のバリエーション）
- 初期画面のタイトル周りのスタイリング詳細（フォントサイズ、余白等）
- useReducerのアクション設計とディスパッチ構造
- localStorage保存のデバウンス戦略

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<canonical_refs>

## Canonical References

### デザインテーマ

- `.planning/PROJECT.md` §Design — カラーパレット10色、タイポグラフィ、UIルール（ボーダー、角丸、ヘッダーなし、保存表示なし）

### データ構造

- `.planning/PROJECT.md` §Design > データ構造 — State型の完全な定義（chars, maps, logs, days, activeChar, activeDay, currentTime）

### 要件

- `.planning/REQUIREMENTS.md` §Setup — SETUP-01〜SETUP-04の詳細要件

### アーキテクチャ

- `CLAUDE.md` §Architecture — Feature-Sliced Designのレイヤー構造、インポートルール、バレルファイル規約

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/shared/ui/` — Button, Input, Field, Item, Label, Separator, Skeleton コンポーネント群。テーマ適用後もそのまま使える
- `src/shared/lib/utils.ts` — `cn()`ユーティリティ（clsx + tailwind-merge）。クラス結合に使用
- `src/app/providers/ErrorBoundary/` — ErrorBoundaryコンポーネント。そのまま残して活用

### Established Patterns

- Feature-Sliced Design: `app/` → `pages/` → `widgets/` → `features/` → `shared/` のレイヤー構造
- バレルファイル: 各sliceの`index.ts`からのみexport
- shadcn/uiスタイル: CVA (class-variance-authority) によるバリアント管理

### Integration Points

- `src/app/index.tsx` — エントリーポイント。Convex/Clerkプロバイダーを削除し、シンプルなReactDOM.createRootに置き換える
- `src/app/routes/` — ルーティング層。wouter削除後は不要になる
- `package.json` — Convex, Clerk, wouter, next-themes等の依存を削除

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 01-foundation_
_Context gathered: 2026-03-22_
