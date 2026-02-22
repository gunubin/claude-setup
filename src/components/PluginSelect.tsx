import React, { useMemo } from "react";
import { Box, Text } from "ink";
import { MultiSelect } from "@inkjs/ui";
import {
  loadPlugins,
  loadProjectPlugins,
  getEffectiveState,
} from "../lib/plugins.js";

interface Props {
  onDone: (selected: string[]) => void;
}

export function PluginSelect({ onDone }: Props) {
  const plugins = useMemo(() => loadPlugins(), []);
  const projectPlugins = useMemo(() => loadProjectPlugins(), []);

  if (plugins.length === 0) {
    return <Text color="yellow">No plugins installed.</Text>;
  }

  const options = plugins.map((p) => {
    const source = p.name in projectPlugins ? "P" : "G";
    const status = p.globalEnabled ? "ON" : "OFF";
    return {
      label: `${p.name.padEnd(42)} ${source}:${status}  ${p.description.slice(0, 50)}`,
      value: p.name,
    };
  });

  const defaultValue = plugins
    .filter((p) => getEffectiveState(p, projectPlugins))
    .map((p) => p.name);

  return (
    <Box flexDirection="column">
      <MultiSelect
        options={options}
        defaultValue={defaultValue}
        onSubmit={(values) => onDone(values)}
      />
      <Text> </Text>
      <Text dimColor>G:ON/OFF = global P:ON/OFF = project override</Text>
      <Text dimColor>↑↓ move space toggle enter confirm</Text>
    </Box>
  );
}
