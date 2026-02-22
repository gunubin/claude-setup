import * as fs from "node:fs";
import * as tty from "node:tty";
import meow from "meow";
import React from "react";
import { render } from "ink";
import { App } from "./App.js";
import { listCurrentConfig } from "./lib/settings.js";

const cli = meow(
  `
  Usage
    $ cc-pick              MCP + plugins
    $ cc-pick --mcp        MCP servers only
    $ cc-pick --plugins    Plugins only
    $ cc-pick --list       Show current config
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

// process.stdin が TTY でない場合（tmux popup の fish -c 経由など）、
// /dev/tty を直接開いて TTY stdin を確保する
let stdinStream: tty.ReadStream | typeof process.stdin = process.stdin;
if (!process.stdin.isTTY) {
  try {
    const fd = fs.openSync("/dev/tty", "r");
    stdinStream = new tty.ReadStream(fd);
  } catch {
    process.stderr.write(
      "Warning: no TTY available. Interactive mode may not work.\n",
    );
  }
}

render(<App mode={mode as "mcp" | "plugins" | "both"} />, {
  stdin: stdinStream,
});
