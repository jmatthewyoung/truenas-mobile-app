import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { clearSelectedServerId } from '@/storage/servers';

const colors = Colors.dark;

export default function TabLayout() {
  const router = useRouter();

  const handleLogout = async () => {
    await clearSelectedServerId();
    router.replace('/');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarButton: HapticTab,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => { void handleLogout(); }}
            style={{ marginLeft: 16 }}
            activeOpacity={0.7}
          >
            <IconSymbol name="arrow.left.square" size={24} color={colors.text} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="storage"
        options={{
          title: 'Storage',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="internaldrive.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: 'Apps',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.2x2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="system"
        options={{
          title: 'System',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
