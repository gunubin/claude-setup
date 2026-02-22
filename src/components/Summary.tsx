import React, { useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { loadPresets, loadCurrentMcp, writeMcpJson } from "../lib/mcp.js";
import { loadPlugins } from "../lib/plugins.js";
import { writeProjectPlugins } from "../lib/settings.js";

interface Props {
  selectedMcp: string[];
  selectedPlugins: string[];
  mode: "mcp" | "plugins" | "both";
  onApplied: () => void;
  onCancel: () => void;
}

export function Summary({
  selectedMcp,
  selectedPlugins,
  mode,
  onApplied,
  onCancel,
}: Props) {
  const presets = useMemo(() => loadPresets(), []);
  const currentMcp = useMemo(() => loadCurrentMcp(), []);
  const plugins = useMemo(() => loadPlugins(), []);

  // MCP diff
  const addedMcp = selectedMcp.filter((s) => !currentMcp.includes(s));
  const removedMcp = currentMcp.filter((s) => !selectedMcp.includes(s));

  // Plugin diff: only items that differ from global
  const pluginChanges = useMemo(() => {
    if (mode === "mcp") return [];
    return plugins
      .filter((p) => {
        const isSelected = selectedPlugins.includes(p.name);
        return isSelected !== p.globalEnabled;
      })
      .map((p) => {
        const isSelected = selectedPlugins.includes(p.name);
        return {
          name: p.name,
          newState: isSelected,
          reason: `G:${p.globalEnabled ? "ON" : "OFF"} → ${isSelected ? "ON" : "OFF"}`,
        };
      });
  }, [mode, plugins, selectedPlugins]);

  useInput((input, key) => {
    if (input === "y" || input === "Y" || key.return) {
      if (mode !== "plugins") {
        writeMcpJson(selectedMcp, presets);
      }
      if (mode !== "mcp") {
        writeProjectPlugins(selectedPlugins, plugins);
      }
      onApplied();
    } else if (input === "n" || input === "N" || key.escape) {
      onCancel();
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold>Changes:</Text>
      <Text> </Text>

      {mode !== "plugins" && (
        <Box flexDirection="column">
          <Text>.mcp.json:</Text>
          {addedMcp.map((name) => (
            <Text key={name} color="green">
              {"  "}+ {name}
            </Text>
          ))}
          {removedMcp.map((name) => (
            <Text key={name} color="red">
              {"  "}- {name}
            </Text>
          ))}
          {addedMcp.length === 0 && removedMcp.length === 0 && (
            <Text dimColor>{"  "}(no changes)</Text>
          )}
          <Text> </Text>
        </Box>
      )}

      {mode !== "mcp" && (
        <Box flexDirection="column">
          <Text>.claude/settings.json (enabledPlugins):</Text>
          {pluginChanges.map((c) => (
            <Text key={c.name} color={c.newState ? "green" : "red"}>
              {"  "}
              {c.newState ? "+" : "-"} {c.name}: {String(c.newState)} (
              {c.reason})
            </Text>
          ))}
          {pluginChanges.length === 0 && (
            <Text dimColor>
              {"  "}(no overrides needed - all match global)
            </Text>
          )}
          <Text> </Text>
        </Box>
      )}

      <Text>Apply? (Y/n)</Text>
    </Box>
  );
}
