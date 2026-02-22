import meow from "meow";
import React from "react";
import { render } from "ink";
import { App } from "./App.js";
import { listCurrentConfig } from "./lib/settings.js";

const cli = meow(
  `
  Usage
    $ claude-setup              MCP + plugins
    $ claude-setup --mcp        MCP servers only
    $ claude-setup --plugins    Plugins only
    $ claude-setup --list       Show current config
`,
  {
    importMeta: import.meta,
    flags: {
      mcp: { type: "boolean", default: false },
      plugins: { type: "boolean", default: false },
      list: { type: "boolean", default: false },
    },
  },
);

if (cli.flags.list) {
  listCurrentConfig();
  process.exit(0);
}

const mode = cli.flags.mcp
  ? "mcp"
  : cli.flags.plugins
    ? "plugins"
    : "both";

render(<App mode={mode as "mcp" | "plugins" | "both"} />);
