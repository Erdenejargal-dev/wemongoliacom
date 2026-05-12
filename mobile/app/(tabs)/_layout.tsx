import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: focused ? C.blue : C.bgPage,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconSymbol
        name={name as any}
        size={22}
        color={focused ? '#FFFFFF' : C.textSubtle}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 72,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#D5E8F5',
          paddingBottom: 0,
          paddingTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="house.fill" focused={focused} />,
          tabBarAccessibilityLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="sparkles" focused={focused} />,
          tabBarAccessibilityLabel: 'AI Assistant',
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="map.fill" focused={focused} />,
          tabBarAccessibilityLabel: 'Map',
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="bookmark.fill" focused={focused} />,
          tabBarAccessibilityLabel: 'My Trips',
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="square.grid.2x2.fill" focused={focused} />,
          tabBarAccessibilityLabel: 'More',
        }}
      />
    </Tabs>
  );
}
