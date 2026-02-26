import fs from "node:fs";
import path from "node:path";
import { loadPresets, loadCurrentMcp } from "./mcp.js";
import {
  loadPlugins,
  loadProjectPlugins,
  getEffectiveState,
  type PluginInfo,
} from "./plugins.js";

export function writeProjectPlugins(
  selectedNames: string[],
  allPlugins: PluginInfo[],
) {
  const settingsPath = path.resolve(".claude", "settings.json");
  const fileExists = fs.existsSync(settingsPath);

  let settings: Record<string, unknown> = {};
  if (fileExists) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    } catch {
      settings = {};
    }
  }

  // Only write overrides that differ from global
  const enabledPlugins: Record<string, boolean> = {};
  let hasDiff = false;

  for (const plugin of allPlugins) {
    const isSelected = selectedNames.includes(plugin.name);
    if (isSelected !== plugin.globalEnabled) {
      enabledPlugins[plugin.name] = isSelected;
      hasDiff = true;
    }
  }

  if (hasDiff) {
    settings.enabledPlugins = enabledPlugins;
  } else {
    delete settings.enabledPlugins;
  }

  if (!fileExists && Object.keys(settings).length === 0) {
    return;
  }

  // Ensure .claude/ directory exists
  const dir = path.dirname(settingsPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
}

export function listCurrentConfig() {
  const presets = loadPresets();
  const currentMcp = loadCurrentMcp();

  console.log("MCP Servers:");
  if (currentMcp.length === 0) {
    console.log("  (none)");
  } else {
    for (const name of currentMcp) {
      const preset = presets.find((p) => p.name === name);
      const desc = preset ? `  ${preset.description}` : "";
      console.log(`  * ${name}${desc}`);
    }
  }

  console.log("");

  const plugins = loadPlugins();
  const projectPlugins = loadProjectPlugins();

  console.log("Plugins:");
  if (plugins.length === 0) {
    console.log("  (none installed)");
  } else {
    for (const plugin of plugins) {
      const effective = getEffectiveState(plugin, projectPlugins);
      const source = plugin.name in projectPlugins ? "P" : "G";
      const status = effective ? "ON" : "OFF";
      const marker = effective ? "*" : " ";
      console.log(
        `  ${marker} ${plugin.name}  ${source}:${status}  ${plugin.description}`,
      );
    }
  }
}
