# Dual Bot Pair Programming 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Claude (既存Bot) と Codex (新規Bot) が同じDiscordチャンネルで対等にペアプロし、目的完遂まで自律的に開発を進める構成を作る

**Architecture:** clawdbot の `--profile` フラグで2つ目のインスタンスを完全分離して起動。両方に `allowBots: true` を設定し、互いのメッセージに反応可能にする。ワークスペースは `D:\senaa_dev\energy-calc-service` を共有し、ターン制で交互に編集する。

**Tech Stack:** clawdbot, Discord API, OpenAI Codex (o3/o4-mini), Anthropic Claude Opus 4.5

---

### Task 1: Discord Developer Portal で新しいボットを作成

**手動作業 (ブラウザ)**

**Step 1: アプリケーション作成**
- https://discord.com/developers/applications を開く
- 「New Application」→ 名前: `CodexBot` (任意)

**Step 2: Bot トークン取得**
- 左メニュー「Bot」→「Reset Token」→ トークンをコピー
- **Message Content Intent** を ON にする

**Step 3: サーバーに招待**
- 左メニュー「OAuth2」→「URL Generator」
- Scopes: `bot`
- Bot Permissions: `Send Messages`, `Read Message History`, `Add Reactions`
- 生成URLを開いて既存サーバー (guild: `1461600674776219885`) に招待

**Step 4: ボットのユーザーIDを控える**
- 招待後、Discordでボットを右クリック →「IDをコピー」

---

### Task 2: Codex プロファイルの初期設定

**Step 1: clawdbot configure を --profile codex で実行**

Run:
```bash
clawdbot --profile codex configure
```

ウィザードが起動するので以下を設定:
- Auth: OpenAI Codex (codex-cli の認証を再利用)
- Workspace: `D:\senaa_dev\energy-calc-service`

**Step 2: 設定ファイルを確認**

Run:
```bash
cat ~/.clawdbot-codex/clawdbot.json
```

Expected: 新しい設定ファイルが生成されている

---

### Task 3: Codex プロファイルの設定を編集

**Files:**
- Modify: `~/.clawdbot-codex/clawdbot.json`

**Step 1: 設定ファイルを以下の内容に編集**

```json5
{
  "agents": {
    "defaults": {
      "workspace": "D:\\senaa_dev\\energy-calc-service",
      "model": {
        "primary": "openai-codex/o3"
      },
      "compaction": {
        "mode": "safeguard"
      },
      "maxConcurrent": 4,
      "subagents": {
        "maxConcurrent": 8
      }
    }
  },
  "channels": {
    "discord": {
      "enabled": true,
      "token": "<Task 1 で取得した新ボットのトークン>",
      "allowBots": true,
      "groupPolicy": "open",
      "guilds": {
        "1461600674776219885": {
          "users": [
            "1010027560085766174",
            "1464611619882401915"
          ],
          "channels": {
            "1464618854880907467": {
              "allow": true
            },
            "1461600675288059926": {
              "allow": true
            }
          }
        }
      }
    }
  },
  "gateway": {
    "port": 18790,
    "mode": "local",
    "bind": "loopback"
  },
  "plugins": {
    "entries": {
      "discord": {
        "enabled": true
      }
    }
  },
  "tools": {
    "web": {
      "search": { "enabled": true },
      "fetch": { "enabled": true }
    }
  }
}
```

**Notes:**
- `allowBots: true` → 他のボットのメッセージに反応する
- `users` に既存ボットのID (`1464611619882401915`) を追加 → ClaudeボットからのメッセージにCodexが反応
- `port: 18790` → 既存 gateway (18789) とポート衝突を回避

---

### Task 4: 既存ボット (Claude) の設定を更新

**Files:**
- Modify: `C:\Users\senaa\.clawdbot\clawdbot.json`

**Step 1: allowBots と 新ボットのユーザーIDを追加**

変更箇所:
```json5
{
  "channels": {
    "discord": {
      "enabled": true,
      "token": "...(既存のまま)",
      "allowBots": true,              // 追加
      "groupPolicy": "open",
      "guilds": {
        "dm": { ... },
        "1461600674776219885": {
          "users": [
            "1010027560085766174",
            "<新ボットのユーザーID>"     // 追加
          ],
          "channels": { ... }
        }
      }
    }
  }
}
```

**Step 2: 既存 gateway を再起動して設定を反映**

---

### Task 5: Codex gateway を起動

**Step 1: gateway 起動**

Run:
```bash
clawdbot --profile codex gateway --port 18790
```

Expected:
```
[gateway] listening on ws://127.0.0.1:18790
[discord] logged in to discord as <新ボットのID>
```

**Step 2: Discord で確認**

- サーバーのメンバーリストに新ボットがオンラインで表示されること
- 既存ボット (MyClawdbot) もオンラインであること

---

### Task 6: 動作テスト

**Step 1: Discord チャンネルで指示を出す**

テストメッセージ:
```
@MyClawdbot @CodexBot
D:\senaa_dev\energy-calc-service のREADMEを読んで、
このプロジェクトの現状を把握して報告してください。
お互いの報告を確認し合ってください。
```

**Step 2: 確認事項**
- 両方のボットが反応すること
- 互いのメッセージを読んで返答していること
- ワークスペースのファイルにアクセスできていること

**Step 3: 開発テスト**

```
@MyClawdbot @CodexBot
energy-calc-service に単体テストが不足しています。
二人で相談して、最も重要なテストから順に追加してください。
完了したらcommitしてください。
```

Expected:
- 片方が設計を提案 → もう片方がレビュー → 実装 → レビュー のサイクルが回る
- 最終的にコミットされる

---

## 注意事項

### 無限ループのリスク管理
- ユーザーが意図的に無限会話を許可しているため、ターン制限は設けない
- ただし API コスト が青天井になる可能性あり
- 必要に応じて Discord チャンネルで `stop` や `中止` と発言して手動停止

### ファイル競合の回避
- 両ボットの AGENTS.md に「相手が編集中のファイルは触らない」「コミット後に相手に引き継ぐ」ルールを記載することを推奨
