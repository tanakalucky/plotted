# Requirements: Plotted.

**Defined:** 2026-03-22
**Core Value:** キャラクターの位置をマップ上にプロットし、時系列で追跡できること

## v1 Requirements

### Setup

- [x] **SETUP-01**: 既存のTodoアプリ・Convex・Clerk関連コードを全て削除し、ビルドが通る状態にする
- [x] **SETUP-02**: アプリ全体の状態をuseReducerで管理し、全操作後にlocalStorageへ自動保存・リロード時に自動復元する
- [x] **SETUP-03**: マップ画像をIndexedDB（idb-keyval）に保存し、localStorage容量制限を回避する
- [x] **SETUP-04**: クラシック・ノワールのカラーテーマ・タイポグラフィ・UIルールをTailwind CSS変数として定義する

### Character

- [x] **CHAR-01**: 名前（最大10文字）とカラーを指定してキャラクターを追加できる
- [x] **CHAR-02**: キャラクターチップをクリックしてアクティブキャラクターを切り替えられる
- [x] **CHAR-03**: キャラクターを削除すると、関連するプロットデータもカスケード削除される

### Time

- [x] **TIME-01**: Day1〜Day7を選択でき、+/-ボタンでDay数を増減できる
- [x] **TIME-02**: Dayを減らした場合、該当Day以降のログが自動削除される
- [x] **TIME-03**: スライダーで10分単位（00:00〜23:50）の時刻を操作できる
- [x] **TIME-04**: -10m / -5m / +5m / +10m ボタンで時刻を微調整できる

### Map

- [x] **MAP-01**: マップを最大4枚まで追加・削除でき、削除時に関連プロットデータもカスケード削除される
- [x] **MAP-02**: 各マップにローカルファイルから画像を読み込める。未設定時は「画像をアップロードしてください」と表示する
- [x] **MAP-03**: マップを最大2カラムで並列表示し、同時に見比べられる

### Plot

- [x] **PLOT-01**: 選択中のキャラクター・Day・時刻で、マップ上をクリックして位置を記録できる（比率座標 0.0〜1.0）
- [x] **PLOT-02**: 選択中のDay・時刻に記録された全キャラクターのドットをマップ上に常時表示する
- [x] **PLOT-03**: ドットをクリックで即削除でき、ホバー時に削除インジケーターを表示する

### Data

- [x] **DATA-01**: リセットボタンで全データを初期化できる（確認ダイアログあり）

## v2 Requirements

### Export

- **EXPORT-01**: マップのスクリーンショットを画像として書き出せる
- **EXPORT-02**: セッションデータをJSONでエクスポート/インポートできる

### UX Enhancement

- **UX-01**: キャラクターのカラーパレットにプリセットを用意する
- **UX-02**: 時刻をキーボード矢印キーでも操作できる

## Out of Scope

| Feature                  | Reason                                                                 |
| ------------------------ | ---------------------------------------------------------------------- |
| 矛盾の自動検出           | ユーザーが目視で判断する設計。検出ロジックはマダミスの推理体験を損なう |
| リアルタイム共有         | バックエンド不要の設計方針。スクリーンシェアで代替                     |
| モバイル最適化           | マップへの精密なプロットはデスクトップ前提                             |
| OAuth/認証               | 個人利用のためログイン不要                                             |
| Undo/Redo                | クリック削除+再プロットで十分。状態管理の複雑化を避ける                |
| ダイスロール・カード機能 | ユドナリウム/ココフォリアの領域                                        |

## Traceability

| Requirement | Phase   | Status   |
| ----------- | ------- | -------- |
| SETUP-01    | Phase 1 | Complete |
| SETUP-02    | Phase 1 | Complete |
| SETUP-03    | Phase 1 | Complete |
| SETUP-04    | Phase 1 | Complete |
| CHAR-01     | Phase 2 | Complete |
| CHAR-02     | Phase 2 | Complete |
| CHAR-03     | Phase 2 | Complete |
| TIME-01     | Phase 2 | Complete |
| TIME-02     | Phase 2 | Complete |
| TIME-03     | Phase 2 | Complete |
| TIME-04     | Phase 2 | Complete |
| DATA-01     | Phase 2 | Complete |
| MAP-01      | Phase 3 | Complete |
| MAP-02      | Phase 3 | Complete |
| MAP-03      | Phase 3 | Complete |
| PLOT-01     | Phase 3 | Complete |
| PLOT-02     | Phase 3 | Complete |
| PLOT-03     | Phase 3 | Complete |

**Coverage:**

- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---

_Requirements defined: 2026-03-22_
_Last updated: 2026-03-22 after roadmap creation_
