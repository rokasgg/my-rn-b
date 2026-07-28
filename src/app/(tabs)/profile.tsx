import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useAuthStore } from '@/store/useAuthStore';
import { pickAvatarImage } from '@/utils/image';
import { toast } from '@/utils/toast';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const uploadAvatar = useAuthStore((state) => state.uploadAvatar);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const signOut = useAuthStore((state) => state.signOut);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const name = (user?.user_metadata?.name as string | undefined) ?? 'Anonymous';
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const email = user?.email ?? '';

  const handleEditAvatar = async () => {
    const uri = await pickAvatarImage();
    if (!uri) return;

    setIsUploadingAvatar(true);
    const { url, error: uploadError } = await uploadAvatar(uri);

    if (uploadError || !url) {
      setIsUploadingAvatar(false);
      toast.error(uploadError ?? 'Failed to upload avatar.');
      return;
    }

    const { error: updateError } = await updateProfile({ avatarUrl: url });
    setIsUploadingAvatar(false);

    if (updateError) {
      toast.error(updateError);
      return;
    }

    toast.success('Avatar updated!');
  };

  const handleResetPassword = async () => {
    if (!email) return;
    const { error } = await resetPassword(email);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Password reset email sent!');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const { error } = await signOut();

          if (error) {
            toast.error(error);
            return;
          }

          toast.success('Signed out.');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-6 py-8">
        <View className="items-center gap-3">
          <View className="relative">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-800"
                contentFit="cover"
              />
            ) : (
              <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                <Ionicons name="person" size={40} color="#8e8e93" />
              </View>
            )}

            <Pressable
              onPress={handleEditAvatar}
              disabled={isUploadingAvatar}
              accessibilityRole="button"
              accessibilityLabel="Change avatar"
              className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white"
            >
              {isUploadingAvatar ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="pencil" size={16} color="#ffffff" />
              )}
            </Pressable>
          </View>

          <View className="items-center gap-0.5">
            <Text className="text-xl font-bold text-black dark:text-white">{name}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">{email}</Text>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
            Appearance
          </Text>
          <ThemeSwitcher />
        </View>

        <View className="gap-3">
          <Text className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
            Account
          </Text>

          <View className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <Pressable
              onPress={() => router.push('/modal/edit-profile')}
              className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3.5 dark:border-gray-800"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="person-outline" size={20} color="#8e8e93" />
                <Text className="text-base text-black dark:text-white">Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8e8e93" />
            </Pressable>

            <Pressable
              onPress={handleResetPassword}
              className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3.5 dark:border-gray-800"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="lock-closed-outline" size={20} color="#8e8e93" />
                <Text className="text-base text-black dark:text-white">Reset Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8e8e93" />
            </Pressable>

            <Pressable
              onPress={() => toast.info('Privacy policy coming soon.')}
              className="flex-row items-center justify-between px-4 py-3.5"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="document-text-outline" size={20} color="#8e8e93" />
                <Text className="text-base text-black dark:text-white">Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8e8e93" />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={handleSignOut}
          className="items-center rounded-lg border border-red-600 py-3 dark:border-red-500"
        >
          <Text className="font-semibold text-red-600 dark:text-red-500">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
