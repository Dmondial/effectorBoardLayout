import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BoardScreen } from '../screens/BoardScreen';
import { MyEffectorsScreen } from '../screens/MyEffectorsScreen';
import { AddEditEffectorScreen } from '../screens/AddEditEffectorScreen';
import { MyEffector } from '../types';
import { APP_COLORS } from '../constants/colors';

// Stack navigator for My Effectors tab
export type MyEffectorsStackParamList = {
  MyEffectors: undefined;
  AddEditEffector: { effector?: MyEffector };
};

const MyEffectorsStack = createNativeStackNavigator<MyEffectorsStackParamList>();

function MyEffectorsNavigator() {
  return (
    <MyEffectorsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: APP_COLORS.surface },
        headerTintColor: APP_COLORS.text,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <MyEffectorsStack.Screen
        name="MyEffectors"
        component={MyEffectorsScreen}
        options={{ title: 'マイエフェクター' }}
      />
      <MyEffectorsStack.Screen
        name="AddEditEffector"
        component={AddEditEffectorScreen}
        options={({ route }) => ({
          title: route.params?.effector ? 'エフェクターを編集' : 'エフェクターを登録',
        })}
      />
    </MyEffectorsStack.Navigator>
  );
}

// Bottom tab navigator
type TabParamList = {
  Board: undefined;
  MyEffectorsTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export function AppNavigator() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: APP_COLORS.surface,
          borderTopColor: APP_COLORS.border,
          height: tabBarHeight,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: APP_COLORS.primary,
        tabBarInactiveTintColor: APP_COLORS.textSecondary,
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Board"
        component={BoardScreen}
        options={{
          title: 'ボード',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>📐</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MyEffectorsTab"
        component={MyEffectorsNavigator}
        options={{
          title: 'マイエフェクター',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>🎸</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
