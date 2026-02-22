import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface PluginInfo {
  name: string;
  description: string;
  globalEnabled: boolean;
}

interface InstalledPlugins {
  version: number;
  plugins: Record<
    string,
    Array<{
      scope: string;
      installPath: string;
      version: string;
    }>
  >;
}

export function loadPlugins(): PluginInfo[] {
  const installedPath = path.join(
    os.homedir(),
    ".claude",
    "plugins",
    "installed_plugins.json",
  );
  if (!fs.existsSync(installedPath)) return [];

  let installed: InstalledPlugins;
  try {
    installed = JSON.parse(fs.readFileSync(installedPath, "utf-8"));
  } catch {
    return [];
  }

  const globalEnabled = loadGlobalEnabledPlugins();
  const plugins: PluginInfo[] = [];

  for (const [name, entries] of Object.entries(installed.plugins ?? {})) {
    const entry = entries[0];
    if (!entry) continue;

    const pluginJsonPath = path.join(
      entry.installPath,
      ".claude-plugin",
      "plugin.json",
    );
    let description = "No description";
    if (fs.existsSync(pluginJsonPath)) {
      try {
        const pluginJson = JSON.parse(
          fs.readFileSync(pluginJsonPath, "utf-8"),
        );
        description = pluginJson.description ?? description;
      } catch {
        // ignore parse errors
      }
    }

    plugins.push({
      name,
      description,
      globalEnabled: globalEnabled[name] === true,
    });
  }

  return plugins;
}

function loadGlobalEnabledPlugins(): Record<string, boolean> {
  const settingsPath = path.join(os.homedir(), ".claude", "settings.json");
  if (!fs.existsSync(settingsPath)) return {};

  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    return settings.enabledPlugins ?? {};
  } catch {
    return {};
  }
}

export function loadProjectPlugins(): Record<string, boolean> {
  const settingsPath = path.resolve(".claude", "settings.json");
  if (!fs.existsSync(settingsPath)) return {};

  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    return settings.enabledPlugins ?? {};
  } catch {
    return {};
  }
}

export function getEffectiveState(
  plugin: PluginInfo,
  projectPlugins: Record<string, boolean>,
): boolean {
  if (plugin.name in projectPlugins) {
    return projectPlugins[plugin.name];
  }
  return plugin.globalEnabled;
}
