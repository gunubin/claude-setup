# claude-setup

Interactive CLI for configuring Claude Code MCP servers and plugins per project.

## Usage

```bash
npx claude-setup              # MCP + plugins
npx claude-setup --mcp        # MCP servers only
npx claude-setup --plugins    # Plugins only
npx claude-setup --list       # Show current config
```

## Data Sources

| Data | Path |
|------|------|
| MCP presets | `~/.config/claude/mcp-presets/*.json` |
| Current MCP | `.mcp.json` |
| Installed plugins | `~/.claude/plugins/installed_plugins.json` |
| Global plugin settings | `~/.claude/settings.json` |
| Project plugin settings | `.claude/settings.json` |

## Development

```bash
npm install
npm run build
node dist/cli.js
```
