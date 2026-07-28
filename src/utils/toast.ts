import { toast as burntToast } from 'burnt';

function show(title: string, preset: 'done' | 'error' | 'none', haptic: 'success' | 'warning' | 'error') {
  burntToast({
    title,
    preset,
    haptic,
    duration: 3,
  });
}

export const toast = {
  success: (title: string) => show(title, 'done', 'success'),
  error: (title: string) => show(title, 'error', 'error'),
  info: (title: string) => show(title, 'none', 'warning'),
};
