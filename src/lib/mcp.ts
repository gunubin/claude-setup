import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface McpPreset {
  name: string;
  description: string;
  tags: string[];
  requiredEnvVars: string[];
  config: Record<string, unknown>;
}

export function loadPresets(): McpPreset[] {
  const presetsDir = path.join(
    os.homedir(),
    ".config",
    "claude",
    "mcp-presets",
  );
  if (!fs.existsSync(presetsDir)) return [];

  const files = fs
    .readdirSync(presetsDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  return files.map((file) => {
    const content = JSON.parse(
      fs.readFileSync(path.join(presetsDir, file), "utf-8"),
    );
    const { _meta, ...config } = content;
    return {
      name: path.basename(file, ".json"),
      description: _meta?.description ?? "No description",
      tags: _meta?.tags ?? [],
      requiredEnvVars: _meta?.requiredEnvVars ?? [],
      config,
    };
  });
}

export function loadCurrentMcp(): string[] {
  const mcpPath = path.resolve(".mcp.json");
  if (!fs.existsSync(mcpPath)) return [];

  try {
    const content = JSON.parse(fs.readFileSync(mcpPath, "utf-8"));
    return Object.keys(content.mcpServers ?? {});
  } catch {
    return [];
  }
}

export function writeMcpJson(selectedNames: string[], presets: McpPreset[]) {
  const mcpServers: Record<string, unknown> = {};
  for (const name of selectedNames) {
    const preset = presets.find((p) => p.name === name);
    if (preset) {
      mcpServers[name] = preset.config;
    }
  }
  fs.writeFileSync(
    ".mcp.json",
    JSON.stringify({ mcpServers }, null, 2) + "\n",
  );
}
