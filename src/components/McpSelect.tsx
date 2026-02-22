import React, { useMemo } from "react";
import { Box, Text } from "ink";
import { MultiSelect } from "@inkjs/ui";
import { loadPresets, loadCurrentMcp } from "../lib/mcp.js";

interface Props {
  onDone: (selected: string[]) => void;
}

export function McpSelect({ onDone }: Props) {
  const presets = useMemo(() => loadPresets(), []);
  const currentMcp = useMemo(() => loadCurrentMcp(), []);

  if (presets.length === 0) {
    return (
      <Text color="yellow">
        No MCP presets found in ~/.config/claude/mcp-presets/
      </Text>
    );
  }

  const options = presets.map((p) => ({
    label: `${p.name.padEnd(24)} ${p.description}`,
    value: p.name,
  }));

  return (
    <Box flexDirection="column">
      <MultiSelect
        options={options}
        defaultValue={currentMcp}
        onSubmit={(values) => onDone(values)}
      />
      <Text> </Text>
      <Text dimColor>↑↓ move space toggle enter confirm</Text>
    </Box>
  );
}
