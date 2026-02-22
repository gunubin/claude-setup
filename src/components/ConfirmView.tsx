import React from "react";
import { Box, Text } from "ink";
import type { PluginInfo } from "../lib/plugins.js";

interface Props {
  mode: "mcp" | "plugins" | "both";
  selectedMcp: Set<string>;
  currentMcp: string[];
  selectedPlugins: Set<string>;
  plugins: PluginInfo[];
}

export function ConfirmView({
  mode,
  selectedMcp,
  currentMcp,
  selectedPlugins,
  plugins,
}: Props) {
  const addedMcp = [...selectedMcp].filter((s) => !currentMcp.includes(s));
  const removedMcp = currentMcp.filter((s) => !selectedMcp.has(s));

  const pluginChanges = plugins
    .filter((p) => selectedPlugins.has(p.name) !== p.globalEnabled)
    .map((p) => ({
      name: p.name,
      newState: selectedPlugins.has(p.name),
      from: p.globalEnabled ? "ON" : "OFF",
      to: selectedPlugins.has(p.name) ? "ON" : "OFF",
    }));

  return (
    <Box flexDirection="column">
      <Text bold color="yellow">
        Confirm Changes
      </Text>
      <Text> </Text>

      {mode !== "plugins" && (
        <>
          <Text bold>.mcp.json:</Text>
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
        </>
      )}

      {mode !== "mcp" && (
        <>
          <Text bold>.claude/settings.json:</Text>
          {pluginChanges.map((c) => (
            <Text key={c.name} color={c.newState ? "green" : "red"}>
              {"  "}
              {c.newState ? "+" : "-"} {c.name} ({c.from} → {c.to})
            </Text>
          ))}
          {pluginChanges.length === 0 && (
            <Text dimColor>{"  "}(all match global)</Text>
          )}
          <Text> </Text>
        </>
      )}

      <Text color="yellow">Apply? (Y/n)</Text>
    </Box>
  );
}
