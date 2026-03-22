# Phase 3: Maps and Plotting - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

マップ管理（最大4枚、画像アップロード、2カラム表示）とコアのクリック→プロット→ドット表示→クリック削除のインタラクションを構築する。アリバイ追跡ループの完成。

**制約変更:** マップ最大枚数を3枚→4枚に変更（PROJECT.md・REQUIREMENTS.mdの更新が必要）

</domain>

<decisions>
## Implementation Decisions

### マップカードのレイアウトと画像表示

- **D-01:** 1枚なら全幅表示、2枚以降は2カラムグリッド。3枚目・4枚目は2行目に配置
- **D-02:** マップ最大枚数は4枚（従来の3枚から変更）
- **D-03:** マップカードにはヘッダーバーを設け、マップ名+削除アイコンを配置
- **D-04:** 画像は`object-fit: contain`で表示。アスペクト比を維持し、余白（letterbox）が出ても座標の正確性を優先
- **D-05:** 画像未設定時はノワールテーマに合わせた淡い背景+アップロードアイコン+テキスト（「画像をアップロードしてください」）

### ドットの見た目とインタラクション

- **D-06:** ドットは円+キャラ名のイニシャル1文字表示。キャラカラーで塗り、色と文字の両方で識別可能
- **D-07:** 同一座標付近に複数キャラのドットが重なった場合、そのまま重ねて表示（シンプル）
- **D-08:** ホバー時はドットが「×」マークに変わる（削除インジケーター）
- **D-09:** クリック判定範囲は見た目より少し広め（見た目+数px余白）で使いやすさを確保

### プロット操作時のフィードバックとガード

- **D-10:** activeCharが未選択時にマップをクリックしても何も起きないが、カーソルが変わる（クリック不可を示す `not-allowed` 等）
- **D-11:** プロット成功時にクリック地点で波紋エフェクトを表示
- **D-12:** 同キャラ・同Day・同時刻で複数プロット可能（追加方式、上書きしない）
- **D-13:** マップ上にはcurrentDay+currentTimeに一致するドットのみ表示。他の時刻のドットは非表示

### マップ管理のUI操作

- **D-14:** マップ追加はマップエリア末尾の「＋」カード型ボタン（空スロットと同サイズ）
- **D-15:** マップ追加時にデフォルト名を自動付与（「マップ1」「マップ2」...）、後からヘッダーバーで編集可能
- **D-16:** 画像の差し替え機能は作らない。変更したい場合はマップ削除→再追加で対応
- **D-17:** マップ削除時、プロットデータがある場合のみ確認ダイアログを表示（「このマップと関連するプロットデータが削除されます」）。プロットなしなら即削除

### Claude's Discretion

- ドットの具体的なサイズ（px）と判定余白の広さ
- 波紋エフェクトの実装方式（CSS animation or SVG）
- letterbox領域のクリック無効化の実装方法
- マップ名編集のUI方式（インライン編集 or ダイアログ）
- 「＋」カードのデザイン詳細
- SVGオーバーレイの実装構造
- reducerの新規アクション設計（ADD_MAP, DELETE_MAP, ADD_LOG, DELETE_LOG等）

</decisions>

<specifics>
## Specific Ideas

- ドットのイニシャル表示により、色覚に依存しない識別も可能にする
- 波紋エフェクトはプロットの「手応え」として機能させる — 目立ちすぎず、操作の確認程度

</specifics>

<canonical_refs>

## Canonical References

### 要件定義

- `.planning/REQUIREMENTS.md` §Map — MAP-01〜MAP-03の詳細要件
- `.planning/REQUIREMENTS.md` §Plot — PLOT-01〜PLOT-03の詳細要件

### データ構造・デザイン

- `.planning/PROJECT.md` §Design > データ構造 — State型定義（maps, logs, x/y座標の比率記録）
- `.planning/PROJECT.md` §Design — カラーテーマ、UIルール（角丸、ボーダー）

### 先行フェーズの決定

- `.planning/phases/01-foundation/1-CONTEXT.md` — D-04〜D-07（永続化戦略、IndexedDB障害時のフォールバック）
- `.planning/phases/02-controls/2-CONTEXT.md` — D-01〜D-04（ツールバーレイアウト、折りたたみ）、D-08（キャラカラーチップ）

### 技術的懸念

- `.planning/STATE.md` §Blockers/Concerns — letterbox座標計算の懸念（getBoundingClientRect + naturalWidth/naturalHeight アプローチ）

### 外部スペック

No external specs — requirements are fully captured in decisions above

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/shared/model/use-map-images.ts` — IndexedDB画像保存/読込/削除が実装済み（saveMapImage, loadMapImage, deleteMapImage）
- `src/shared/model/state.ts` — MapDef, PlotLog型が定義済み。initialStateにmaps: [], logs: []あり
- `src/shared/model/reducer.ts` — ts-pattern exhaustiveパターン。MAP/LOG系アクションを追加する
- `src/shared/ui/Button` — マップ追加/削除ボタンに使用
- `src/shared/lib/utils.ts` — `cn()`ユーティリティ

### Established Patterns

- `useReducer` + localStorage自動永続化（src/shared/model/use-app-state.ts）
- ts-pattern match().exhaustive() によるreducer — 新アクション追加時もコンパイル時チェック
- Feature-Sliced Design: 新機能は `src/features/map-manager/` と `src/features/plot-manager/` に配置
- コンポーネントはstate/dispatchをpropsで受け取る（Phase 2で確立したパターン）

### Integration Points

- `src/pages/home/ui/PlottedApp.tsx` — `{/* Map area — Phase 3 */}` プレースホルダーにマップグリッドを配置
- `src/shared/model/reducer.ts` — ADD_MAP, DELETE_MAP, RENAME_MAP, ADD_LOG, DELETE_LOG アクションを追加
- IndexedDB連携: マップ追加時にsaveMapImage、削除時にdeleteMapImageを呼ぶ（reducer外の副作用）

</code_context>

<deferred>
## Deferred Ideas

- マップのスクリーンショット書き出し — EXPORT-01（v2 Requirements）
- 時刻変更時のドット軌跡表示（全時刻のドットを薄く表示）— 将来のUX改善として検討可能

</deferred>

---

_Phase: 03-maps-and-plotting_
_Context gathered: 2026-03-22_
