import React, { useMemo } from "react";
import { Box, Text } from "ink";

export interface ListItem {
  value: string;
  label: string;
  meta?: string;
  checked: boolean;
}

interface Props {
  items: ListItem[];
  cursor: number;
  active: boolean;
  maxHeight: number;
}

export function ItemList({ items, cursor, active, maxHeight }: Props) {
  const { start, end } = useMemo(() => {
    const height = Math.max(1, maxHeight);
    if (items.length <= height) return { start: 0, end: items.length };

    let s = cursor - Math.floor(height / 2);
    s = Math.max(0, s);
    s = Math.min(items.length - height, s);
    return { start: s, end: s + height };
  }, [items.length, cursor, maxHeight]);

  const visible = items.slice(start, end);
  const hasScrollUp = start > 0;
  const hasScrollDown = end < items.length;

  if (items.length === 0) {
    return <Text dimColor>  (none)</Text>;
  }

  return (
    <Box flexDirection="column">
      {hasScrollUp && <Text dimColor>  ↑ more</Text>}
      {visible.map((item, i) => {
        const realIndex = start + i;
        const isCursor = realIndex === cursor;
        const cursorChar = isCursor && active ? "▸" : " ";
        const checkChar = item.checked ? "✓" : " ";

        return (
          <Text key={item.value}>
            <Text color={isCursor && active ? "cyan" : undefined}>
              {cursorChar}
            </Text>
            <Text color={item.checked ? "green" : "gray"}> {checkChar} </Text>
            <Text
              bold={isCursor && active}
              color={isCursor && active ? "cyan" : undefined}
            >
              {item.label}
            </Text>
            {item.meta && <Text dimColor> {item.meta}</Text>}
          </Text>
        );
      })}
      {hasScrollDown && <Text dimColor>  ↓ more</Text>}
    </Box>
  );
}
