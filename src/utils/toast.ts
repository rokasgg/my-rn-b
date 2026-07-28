import { Alert } from 'react-native';

export const toast = {
  success: (title: string) => Alert.alert(title),
  error: (title: string) => Alert.alert(title),
  info: (title: string) => Alert.alert(title),
};
