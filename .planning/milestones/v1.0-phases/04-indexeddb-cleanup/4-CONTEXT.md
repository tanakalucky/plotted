# Phase 4: Fix IndexedDB Cleanup on Reset - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

RESET action実行時に、既存マップのIndexedDB画像Blobを削除してからstateをクリアする。孤立Blobの蓄積を防ぎ、「全データリセット」のE2Eフローを完成させる。

</domain>

<decisions>
## Implementation Decisions

### クリーンアップの実行方式

- **D-01:** リセットボタンのonClick内で直接処理する。`state.maps`をループして`deleteMapImage(map.id)`を呼び、完了後に`dispatch({ type: "RESET" })`する
- **D-02:** 専用フックやヘルパー関数は作らない。PlottedApp.tsxのonClick内にインラインで記述する
- **D-03:** `deleteMapImage`は既にtry-catchでサイレント失敗する設計（D-06 from Phase 1）。IndexedDB削除失敗時もRESETは続行する（全削除をブロックしない）

### Claude's Discretion

- `Promise.all` vs 逐次実行の選択
- async onClickのエラーハンドリング詳細
- テストの構成と粒度

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<canonical_refs>

## Canonical References

### 要件定義

- `.planning/REQUIREMENTS.md` §Data — DATA-01のリセット要件
- `.planning/REQUIREMENTS.md` §Setup — SETUP-03のIndexedDB要件

### 監査レポート

- `.planning/v1.0-MILESTONE-AUDIT.md` §Integration Gap — INT-01の詳細（RESET does not clean IndexedDB images）
- `.planning/v1.0-MILESTONE-AUDIT.md` §E2E Flow Verification — "Full data reset" flowがpartialである理由

### 先行フェーズの決定

- `.planning/phases/01-foundation/1-CONTEXT.md` — D-04〜D-06（永続化戦略、IndexedDB障害時のフォールバック）
- `.planning/phases/03-maps-and-plotting/3-CONTEXT.md` — D-14〜D-17（マップ管理のUI操作）

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/shared/model/use-map-images.ts` — `deleteMapImage(mapId)` が実装済み。try-catchでサイレント失敗
- `src/shared/model/index.ts` — `deleteMapImage` がexport済み

### Established Patterns

- IndexedDB副作用はreducer外のコンポーネントで実行（Phase 3で確立。MapHeader.tsxでdeleteMapImage呼び出し）
- reducerは純粋関数を維持（副作用なし）

### Integration Points

- `src/pages/home/ui/PlottedApp.tsx:92` — リセットボタンのonClick。現在は`dispatch({ type: "RESET" })`のみ。ここにIndexedDB削除を追加

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 04-indexeddb-cleanup_
_Context gathered: 2026-03-22_
