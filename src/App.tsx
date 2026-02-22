import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { McpSelect } from "./components/McpSelect.js";
import { PluginSelect } from "./components/PluginSelect.js";
import { Summary } from "./components/Summary.js";

type Mode = "mcp" | "plugins" | "both";
type Phase = "mcp" | "plugins" | "summary" | "done" | "cancelled";

interface Props {
  mode: Mode;
}

export function App({ mode }: Props) {
  const { exit } = useApp();
  const [phase, setPhase] = useState<Phase>(
    mode === "plugins" ? "plugins" : "mcp",
  );
  const [selectedMcp, setSelectedMcp] = useState<string[]>([]);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);

  useEffect(() => {
    if (phase === "done" || phase === "cancelled") {
      const timer = setTimeout(() => exit(), 100);
      return () => clearTimeout(timer);
    }
  }, [phase, exit]);

  const handleMcpDone = (selected: string[]) => {
    setSelectedMcp(selected);
    if (mode === "mcp") {
      setPhase("summary");
    } else {
      setPhase("plugins");
    }
  };

  const handlePluginsDone = (selected: string[]) => {
    setSelectedPlugins(selected);
    setPhase("summary");
  };

  const totalPhases = mode === "both" ? 2 : 1;
  const currentPhase =
    phase === "mcp" ? 1 : phase === "plugins" ? (mode === "both" ? 2 : 1) : 0;

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        Claude Setup
      </Text>
      <Text> </Text>

      {phase === "mcp" && (
        <>
          <Text dimColor>
            Phase {currentPhase}/{totalPhases}: MCP Servers
          </Text>
          <Text> </Text>
          <McpSelect onDone={handleMcpDone} />
        </>
      )}

      {phase === "plugins" && (
        <>
          <Text dimColor>
            Phase {currentPhase}/{totalPhases}: Plugins
          </Text>
          <Text> </Text>
          <PluginSelect onDone={handlePluginsDone} />
        </>
      )}

      {phase === "summary" && (
        <Summary
          selectedMcp={selectedMcp}
          selectedPlugins={selectedPlugins}
          mode={mode}
          onApplied={() => setPhase("done")}
          onCancel={() => setPhase("cancelled")}
        />
      )}

      {phase === "done" && <Text color="green">Done!</Text>}
      {phase === "cancelled" && <Text color="yellow">Cancelled.</Text>}
    </Box>
  );
}
