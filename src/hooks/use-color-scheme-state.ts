import { MantineColorScheme, useMantineColorScheme } from '@mantine/core';
import { useCallback } from 'react';
import { useStoredColorScheme } from './use-stored-color-scheme.ts';

export function useColorSchemeState(): [MantineColorScheme, (colorScheme: MantineColorScheme) => void] {
  const [storedColorScheme, setStoredColorScheme] = useStoredColorScheme();
  const mantineColorScheme = useMantineColorScheme();

  const setColorScheme = useCallback(
    (value: string) => {
      setStoredColorScheme(value as MantineColorScheme);
      mantineColorScheme.setColorScheme(value as MantineColorScheme);
    },
    [setStoredColorScheme, mantineColorScheme],
  );

  return [storedColorScheme, setColorScheme];
}
