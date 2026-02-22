# npm 公開品質レビュー - 修正プラン

## Context

`@gunubin/claude-setup` を npm 公開するにあたり、全コードの品質レビューを実施。以下の問題を発見し、修正する。

## 現状の良い点

- 型安全性: `any` ゼロ、`strict: true`、Union型を適切に使用
- 未使用 import/export: ゼロ
- デバッグコード: なし（`console.log` は `--list` 機能の正当な使用のみ）
- 依存関係: 最小限（ink, meow, react の3つ）
- パス解決: `os.homedir()` と `path.resolve()` で環境非依存
- LICENSE (MIT) 存在

---

## 修正項目

### 1. `loadPresets()` の JSON.parse エラーハンドリング追加

**ファイル**: `src/lib/mcp.ts` L27-39

`files.map()` 内の `JSON.parse` が try-catch なし。壊れた JSON プリセットが1つあると全体がクラッシュする。

```typescript
// 現状: try-catch なし
return files.map((file) => {
  const content = JSON.parse(fs.readFileSync(...));
  ...
});

// 修正: 個別にtry-catchし、壊れたファイルをスキップ
return files.flatMap((file) => {
  try {
    const content = JSON.parse(fs.readFileSync(...));
    ...
    return [preset];
  } catch {
    return [];
  }
});
```

### 2. `/dev/tty` のエラーハンドリング追加

**ファイル**: `src/cli.tsx` L41-44

CI/CD パイプラインや Docker コンテナなど `/dev/tty` が存在しない環境で例外スロー。

```typescript
// 現状
if (!process.stdin.isTTY) {
  const fd = fs.openSync("/dev/tty", "r");  // 例外の可能性
  stdinStream = new tty.ReadStream(fd);
}

// 修正: try-catch でフォールバック
if (!process.stdin.isTTY) {
  try {
    const fd = fs.openSync("/dev/tty", "r");
    stdinStream = new tty.ReadStream(fd);
  } catch {
    // /dev/tty が利用不可（CI/CD等）→ process.stdin のまま使用
  }
}
```

### 3. `.mcp.json` の非プリセットサーバー保持

**ファイル**: `src/lib/mcp.ts` の `writeMcpJson()`

現状: `.mcp.json` を完全上書き → ユーザーが手動追加した MCP サーバーが消失する。

```typescript
// 修正: 既存の非プリセットサーバーを保持
export function writeMcpJson(selectedNames: string[], presets: McpPreset[]) {
  const mcpPath = path.resolve(".mcp.json");
  let existing: Record<string, unknown> = {};
  try {
    const content = JSON.parse(fs.readFileSync(mcpPath, "utf-8"));
    existing = content.mcpServers ?? {};
  } catch {
    // ignore
  }

  // プリセット名のセット
  const presetNames = new Set(presets.map((p) => p.name));

  // 非プリセットサーバーを保持
  const mcpServers: Record<string, unknown> = {};
  for (const [name, config] of Object.entries(existing)) {
    if (!presetNames.has(name)) {
      mcpServers[name] = config;
    }
  }

  // 選択されたプリセットを追加
  for (const name of selectedNames) {
    const preset = presets.find((p) => p.name === name);
    if (preset) {
      mcpServers[name] = preset.config;
    }
  }

  fs.writeFileSync(mcpPath, JSON.stringify({ mcpServers }, null, 2) + "\n");
}
```

### 4. `package.json` に `engines` フィールド追加

**ファイル**: `package.json`

tsup target が `node18` なのに engines 未定義。

```json
"engines": {
  "node": ">=18.0.0"
}
```

### 5. `files` フィールドに README.md と LICENSE を追加

**ファイル**: `package.json`

現状 `"files": ["dist"]` のため、npm パッケージに README.md と LICENSE が含まれない。

```json
"files": [
  "dist",
  "README.md",
  "LICENSE"
]
```

---

## 修正対象ファイル

| ファイル | 修正内容 |
|---------|---------|
| `src/lib/mcp.ts` | loadPresets() の try-catch、writeMcpJson() のマージロジック |
| `src/cli.tsx` | /dev/tty の try-catch |
| `package.json` | engines, files フィールド |

## 検証方法

1. `npm run typecheck` で型チェック通過
2. `npm run build` でビルド成功
3. `npm pack --dry-run` でパッケージ内容物を確認（README.md, LICENSE 含む）
4. `node dist/cli.js` で正常動作
5. `node dist/cli.js --list` で正常出力
