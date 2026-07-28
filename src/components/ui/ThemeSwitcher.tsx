import { Pressable, Text, View } from 'react-native';

import { useThemeStore, type ThemeMode } from '@/store/useThemeStore';

const OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export function ThemeSwitcher() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <View className="flex-row rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {OPTIONS.map((option) => {
        const isActive = option.value === mode;

        return (
          <Pressable
            key={option.value}
            onPress={() => setMode(option.value)}
            className={`flex-1 items-center rounded-md py-2 ${
              isActive ? 'bg-white dark:bg-black' : ''
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isActive
                  ? 'text-black dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
