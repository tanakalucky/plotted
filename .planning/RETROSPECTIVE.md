# Project Retrospective

_A living document updated after each milestone. Lessons feed forward into future planning._

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-22
**Phases:** 4 | **Plans:** 7 | **Commits:** 54

### What Was Built

- Convex/Clerk/Todoの完全削除とクラシック・ノワールテーマ（OKLCH CSS変数）
- useReducer + localStorage + IndexedDB永続化レイヤー
- キャラクター管理・Day/時刻管理の全コントロールUI
- マップCRUD（画像アップロード、2カラムグリッド、カスケード削除）
- SVGドットオーバーレイによるクリック→プロット→削除のアリバイ追跡ループ
- リセット時のIndexedDBクリーンアップ（ギャップ修正）

### What Worked

- ts-pattern exhaustive reducerにより未処理アクションをランタイムで即捕捉
- letterbox座標計算をlib/に分離したことでブラウザなしunitテストが可能に
- Feature-Sliced Designにより各機能が独立し、フェーズ間の衝突がなかった
- milestone auditでIndexedDBリークを発見し、Phase 4で即修正できた

### What Was Inefficient

- Phase 2のスライダー仕様（10分→5分、tick数）が実装中に変更された — 事前のライブラリAPI調査が不足
- VERIFICATION.mdのhuman_needed項目（2件）が未解決のまま残った
- REQUIREMENTS.mdの"10分単位"表記が実装変更後も更新されなかった

### Patterns Established

- IndexedDB画像 + localStorage状態の二層ストレージパターン
- ResizeObserverによるコンテナサイズ追跡（windowイベントより精密）
- 比率座標（0.0〜1.0）によるリサイズ耐性のある位置記録
- props drill pattern: useAppStateはPlottedApp一箇所のみ、子はstate/dispatch受け取り

### Key Lessons

1. UIライブラリのAPI（@base-ui/react Slider）は計画段階で実際のAPI仕様を確認すべき — ドキュメントの記述と実装が異なる場合がある
2. milestone auditはギャップの発見に有効 — Phase 4のIndexedDBリーク修正はauditなしでは見逃していた可能性が高い
3. 1日で4フェーズ・7プランを完遂できた — 小規模MVPではフェーズを細かく切りすぎない方が効率的

### Cost Observations

- Model mix: sonnet (executor) + opus (planner)
- Timeline: 約4時間（06:54 → 10:21）
- Notable: Phase 4（1 plan, 1 file変更）は/gsd:quickで十分だった可能性

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Commits | Phases | Key Change           |
| --------- | ------- | ------ | -------------------- |
| v1.0      | 54      | 4      | Initial GSD workflow |

### Cumulative Quality

| Milestone | Tests | LOC   | Tech Debt Items |
| --------- | ----- | ----- | --------------- |
| v1.0      | 69    | 2,622 | 3 (minor)       |

### Top Lessons (Verified Across Milestones)

1. (To be verified with future milestones)
