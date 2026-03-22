# Plotted.

## What This Is

マーダーミステリー向けのアリバイ管理Webアプリ。キャラクターの位置情報を時系列・マップ別に記録し、プレイヤーが目視で矛盾を発見できるようにする。オンライン（Discord等）マダミスプレイヤーが対象。

## Core Value

キャラクターの位置をマップ上にプロットし、時系列で追跡できること。

## Requirements

### Validated

- ✓ React + Tailwind CSS v4 + shadcn/ui のプロジェクト基盤 — existing
- ✓ Feature-Sliced Design アーキテクチャ — existing
- ✓ ErrorBoundary — existing
- ✓ クラシック・ノワール デザインテーマの適用 — Validated in Phase 01: Foundation
- ✓ 既存Todoアプリ/Convexコードの削除 — Validated in Phase 01: Foundation
- ✓ データ永続化（localStorage自動保存・自動復元・リセット） — Validated in Phase 01: Foundation

### Active

- [x] キャラクター管理（追加・選択・削除、名前最大10文字+カラー指定） → Validated in Phase 02: Controls
- [x] Day管理（Day1〜Day7、増減ボタン、Day削減時の関連ログ自動削除） → Validated in Phase 02: Controls
- [x] 時刻管理（5分単位スライダー 00:00〜23:55、微調整ボタン±5m/10m/30m/1h） → Validated in Phase 02: Controls
- [x] マップ管理（最大4枚、2カラム並列表示、画像読み込み、削除時の関連プロット削除） → Validated in Phase 03: Maps & Plotting
- [x] プロット機能（マップクリックで位置記録、ドット表示、クリック削除） → Validated in Phase 03: Maps & Plotting
- [x] クラシック・ノワール デザインテーマの適用 → Validated
- [x] 既存Todoアプリ/Convexコードの削除 → Validated
- [x] データ永続化（localStorage自動保存・自動復元・リセット） → Validated
- [x] リセット時のIndexedDB画像クリーンアップ → Validated in Phase 04: IndexedDB Cleanup

### Out of Scope

- 矛盾の自動検出 — ユーザーが目視で判断する設計
- バックエンド/API — localStorage完結、Cloudflare Workers不使用
- リアルタイム共有 — シングルプレイヤー利用を前提
- モバイル最適化 — デスクトップブラウザを主対象
- OAuth/認証 — 個人利用のためログイン不要

## Context

- 既存コードベースにTodoアプリ（Convex backend）が存在するが、全て削除してPlotted.として作り直す
- Cloudflare Pagesにデプロイ（静的サイト、Workers不使用）
- bunをパッケージマネージャとして使用
- マップ画像はローカルファイルからアップロード。未設定時は「画像をアップロードしてください」表示
- プロット座標はマップ幅・高さに対する比率（0.0〜1.0）で記録

## Constraints

- **Tech Stack**: React + Tailwind CSS v4 + shadcn/ui — 既存基盤を活用
- **Architecture**: Feature-Sliced Design — 既存パターンに従う
- **Deploy**: Cloudflare Pages（静的サイトのみ）
- **Storage**: localStorage only — バックエンド依存なし
- **Package Manager**: bun — npm/yarn/npx不使用
- **Maps**: 最大3枚 — UI表示領域の制約
- **Days**: Day1〜Day7 — マダミスの一般的なゲーム期間
- **Time Resolution**: 5分単位 — プレイに十分な粒度（Phase 02で10分→5分に変更）

## Key Decisions

| Decision                     | Rationale                                        | Outcome    |
| ---------------------------- | ------------------------------------------------ | ---------- |
| localStorage for persistence | バックエンド不要、即座に動作、デプロイがシンプル | ✓ Phase 01 |
| 座標を比率で記録             | マップサイズ変更に耐える設計                     | ✓ Phase 03 |
| 既存Todo/Convexコードを削除  | 完全に異なるアプリのため再利用不可               | ✓ Phase 01 |
| マップ最大4枚・2カラム表示   | 同時比較のため並列表示、画面サイズの制約         | ✓ Phase 03 |
| リセット時にIndexedDB清掃    | orphaned blobの防止、ストレージ衛生              | ✓ Phase 04 |

## Design

### カラーテーマ: クラシック・ノワール

| 用途         | カラー    | 説明                 |
| ------------ | --------- | -------------------- |
| 背景         | `#F5F0E8` | 羊皮紙ベージュ       |
| サーフェス   | `#EDE7D9` | くすんだクリーム     |
| カード       | `#FAF6EE` | オフホワイト         |
| ボーダー     | `#C8B99A` | アンティークゴールド |
| ボーダー薄   | `#DDD3BE` | ライトベージュ       |
| インク（濃） | `#2C2416` | ほぼ黒のブラウン     |
| インク（中） | `#6B5B3E` | ウォームブラウン     |
| インク（薄） | `#9C8B6E` | ミュートブラウン     |
| アクセント   | `#7A4F2A` | ダークアンバー       |
| アクセント薄 | `#F0E4CC` | ペールアンバー       |

### タイポグラフィ

- UI全般: sans-serif（システムフォント）
- 時刻表示: serif体

### UIルール

- ボーダー: `0.5px solid`
- 角丸: `10px`（カード）/ `6px`（ボタン）/ `999px`（チップ）
- ヘッダーなし
- 保存状態の表示なし

### データ構造

```ts
type State = {
  chars: { name: string; color: string }[];
  maps: { id: string; name: string; img: string | null }[];
  logs: {
    id: number;
    char: string;
    map: string;
    day: number;
    time: number; // 0〜287（5分単位のインデックス）
    x: number; // 0.0〜1.0
    y: number; // 0.0〜1.0
  }[];
  days: number; // 1〜7
  activeChar: string | null;
  activeDay: number;
  currentTime: number; // 0〜287（5分単位のインデックス）
};
```

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-03-22 after Phase 04: IndexedDB Cleanup completion_
