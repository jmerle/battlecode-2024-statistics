import { MantineColorScheme } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';

export function useStoredColorScheme(): ReturnType<typeof useLocalStorage<MantineColorScheme>> {
  return useLocalStorage<MantineColorScheme>({
    key: 'battlecode-2024-statistics-color-scheme',
    defaultValue: 'auto',
  });
}
