# Phase 4: Fix IndexedDB Cleanup on Reset - Research

**Researched:** 2026-03-22
**Domain:** IndexedDB side-effect wiring in React event handler
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** リセットボタンのonClick内で直接処理する。`state.maps`をループして`deleteMapImage(map.id)`を呼び、完了後に`dispatch({ type: "RESET" })`する
- **D-02:** 専用フックやヘルパー関数は作らない。PlottedApp.tsxのonClick内にインラインで記述する
- **D-03:** `deleteMapImage`は既にtry-catchでサイレント失敗する設計（D-06 from Phase 1）。IndexedDB削除失敗時もRESETは続行する（全削除をブロックしない）

### Claude's Discretion

- `Promise.all` vs 逐次実行の選択
- async onClickのエラーハンドリング詳細
- テストの構成と粒度

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID       | Description                                                                 | Research Support                                                         |
| -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| DATA-01  | リセットボタンで全データを初期化できる（確認ダイアログあり）                | PlottedApp.tsx line 92 已実装。IndexedDB削除を追加してフローを完成させる |
| SETUP-03 | マップ画像をIndexedDB（idb-keyval）に保存し、localStorage容量制限を回避する | deleteMapImage既存実装で対応可能。RESET時の呼び出しのみ欠落              |

</phase_requirements>

## Summary

Phase 4 は単一ファイル（`PlottedApp.tsx`）への外科的修正である。現在のリセットフローは `dispatch({ type: "RESET" })` のみを呼び出し、IndexedDB に保存されたマップ画像 Blob を削除しない。これにより、リセット後も孤立した Blob がブラウザストレージに蓄積する。

修正は既存の確立パターン（`MapHeader.tsx` での `deleteMapImage` 呼び出し）に完全に倣う。リセットボタンの `onClick` を async 関数に変え、`state.maps` の各エントリに対して `deleteMapImage` を呼び出してから `dispatch` する。`deleteMapImage` はすでに try-catch でサイレント失敗する設計なので、エラーハンドリングは不要。

変更範囲は `PlottedApp.tsx` 1 ファイルのみ。新規ファイル・新規フック・新規ヘルパーは一切不要。テストは `reducer.unit.test.ts` の既存 RESET テスト（状態リセットの検証）が引き続き有効で、IndexedDB 副作用のテストは省略しても問題ない（idb-keyval のモックを要するブラウザテストはこのフェーズのスコープ外）。

**Primary recommendation:** `PlottedApp.tsx` のリセット `onClick` を `async () => { await Promise.all(state.maps.map(m => deleteMapImage(m.id))); dispatch({ type: "RESET" }); }` に変更する。

## Standard Stack

### Core (既存、追加インストール不要)

| Library    | Version | Purpose                    | Why Standard                                            |
| ---------- | ------- | -------------------------- | ------------------------------------------------------- |
| idb-keyval | 既存    | IndexedDB CRUD             | Phase 1 で採用済み。`deleteMapImage` はすでに wrap 済み |
| React      | 19.2.4  | async onClick in component | `void` または `async` onClick は React 19 で問題なし    |

**Installation:** 不要（依存関係の変更なし）

## Architecture Patterns

### Established Pattern: IndexedDB Side-Effect in Event Handler

Phase 3 で `MapHeader.tsx` に確立されたパターン。reducer は純粋関数を維持し、IndexedDB 副作用はコンポーネントのイベントハンドラーで実行する。

**MapHeader.tsx（参照実装）:**

```typescript
// src/features/map-manager/ui/MapHeader.tsx:32-35
const handleDeleteConfirm = () => {
  dispatch({ type: "DELETE_MAP", payload: { id: mapDef.id } });
  void deleteMapImage(mapDef.id);
};
```

### Pattern for Phase 4: Multi-Map Cleanup Before State Reset

**What:** 複数マップの IndexedDB エントリを `Promise.all` で並列削除し、完了後に dispatch する
**When to use:** state クリアと IndexedDB クリアを同期させる必要があるとき
**Example:**

```typescript
// PlottedApp.tsx — リセットボタンの onClick（修正後）
onClick={async () => {
  await Promise.all(state.maps.map((m) => deleteMapImage(m.id)));
  dispatch({ type: "RESET" });
}}
```

`void` パターン（MapHeader）との違い: MapHeader では削除後に state 操作があるため順序は問わないが、RESET では「削除完了 → state クリア」の順序が重要（削除前に maps が空になると ID が取得できなくなる）。

### Anti-Patterns to Avoid

- **reducer 内で副作用を実行:** reducer は純粋関数を維持すること。`RESET` action のハンドラー内で deleteMapImage を呼ぶ設計は採用しない（Phase 1 決定 D-04 の違反）
- **dispatch 前に state を変更:** `dispatch({ type: "RESET" })` の後で `state.maps` を参照すると、maps が空になっている可能性があるため、必ず dispatch の前に maps を走査する
- **専用フック化:** D-02 で明示的に禁止。インラインで十分な複雑度

## Don't Hand-Roll

| Problem        | Don't Build                | Use Instead             | Why                                           |
| -------------- | -------------------------- | ----------------------- | --------------------------------------------- |
| IndexedDB 削除 | 自前の IDBObjectStore 操作 | `deleteMapImage(mapId)` | Phase 1 で実装済み、try-catch 完備            |
| 並列非同期     | 独自の Promise チェーン    | `Promise.all(...)`      | Web 標準、マップ数が最大 4 枚なので並列で十分 |

## Common Pitfalls

### Pitfall 1: dispatch 後に state.maps を参照

**What goes wrong:** `dispatch({ type: "RESET" })` を先に呼ぶと、同一コンポーネントの再レンダリング前でも `state.maps` が参照できなくなる場合がある（React の batched updates）
**Why it happens:** RESET 後の maps は空配列なので、削除対象の ID が失われる
**How to avoid:** 必ず `await Promise.all(...)` を dispatch の前に実行する
**Warning signs:** リセット後も IndexedDB に残ったエントリが確認できる

### Pitfall 2: async onClick の戻り値を void しない

**What goes wrong:** `onClick` が `Promise<void>` を返すと、React は内部的に警告を出す場合がある
**Why it happens:** React の SyntheticEvent ハンドラーは void を期待する
**How to avoid:** `onClick={() => { void (async () => { ... })(); }}` パターン、または `onClick={async () => { ... }}` はそのままで問題なし（React 19 では許容される）
**Warning signs:** TypeScript / ESLint の `no-misused-promises` 警告

### Pitfall 3: maps が 0 件のときの空 Promise.all

**What goes wrong:** maps が空の場合、`Promise.all([])` が呼ばれる
**Why it happens:** ユーザーがマップを追加せずにリセットする場合
**How to avoid:** `Promise.all([])` は即座に resolve するため、特別な処理不要
**Warning signs:** なし（問題にならない）

## Code Examples

### 修正後の PlottedApp.tsx リセットボタン onClick

```typescript
// PlottedApp.tsx:87-97 (修正後)
<Dialog.Close
  render={
    <Button
      variant="destructive"
      size="sm"
      onClick={async () => {
        await Promise.all(state.maps.map((m) => deleteMapImage(m.id)));
        dispatch({ type: "RESET" });
      }}
    >
      リセット
    </Button>
  }
/>
```

### 必要な import の追加

```typescript
// 現在 PlottedApp.tsx に存在しない import を追加
import { deleteMapImage, useAppState } from "@/shared/model";
// ↑ deleteMapImage は既に shared/model/index.ts からエクスポートされている
```

現在の import: `import { useAppState } from "@/shared/model";`
修正後: `import { deleteMapImage, useAppState } from "@/shared/model";`

## State of the Art

| Old Approach  | Current Approach          | When Changed   | Impact                           |
| ------------- | ------------------------- | -------------- | -------------------------------- |
| dispatch のみ | deleteMapImage + dispatch | Phase 4 (今回) | IndexedDB 孤立 Blob の蓄積を防ぐ |

## Open Questions

1. **async onClick の TypeScript 警告**
   - What we know: `onClick={async () => {...}}` は React 19 + TypeScript 5 で型エラーにならない
   - What's unclear: oxlint の `no-misused-promises` ルールが有効かどうか
   - Recommendation: `bun run lint` で確認。警告が出た場合は `onClick={() => { void (async () => { ... })(); }}` パターンに変更

2. **IndexedDB 削除の単体テスト必要性**
   - What we know: `deleteMapImage` 自体のテストは Phase 1 でスコープ外。idb-keyval のモック設定が必要
   - What's unclear: このフェーズでブラウザテストを追加するかどうか
   - Recommendation: 変更は 1 行レベルの修正なので、ブラウザテストなしで型チェック + lint + 既存テストで十分。手動での動作確認（リセット後の IndexedDB を DevTools で確認）を推奨

## Sources

### Primary (HIGH confidence)

- `src/pages/home/ui/PlottedApp.tsx:92` — 現在の RESET dispatch 実装（直接コード確認）
- `src/features/map-manager/ui/MapHeader.tsx:32-35` — 確立された deleteMapImage パターン（直接コード確認）
- `src/shared/model/use-map-images.ts` — deleteMapImage 実装（直接コード確認）
- `src/shared/model/index.ts` — deleteMapImage の export 確認（直接コード確認）
- `.planning/v1.0-MILESTONE-AUDIT.md` §Integration Gap — INT-01 の詳細（直接確認）

### Secondary (MEDIUM confidence)

- React 19 async event handlers — async onClick は React 19 で問題なく動作する（React 公式ドキュメントおよびトレーニングデータより）

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — 既存コードから直接確認
- Architecture: HIGH — Phase 3 で確立された同一パターンを踏襲
- Pitfalls: HIGH — コードを読んで演繹した実際のリスク

**Research date:** 2026-03-22
**Valid until:** このフェーズが完了するまで（安定したコードベース）
