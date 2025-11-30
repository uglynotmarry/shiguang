import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import MainScreen from '../screens/MainScreen';
import PostScreen from '../screens/PostScreen';
import TimePostOfficeScreen from '../screens/TimePostOfficeScreen';
import { BottomNavigation } from '../components/BottomNavigation';

export type RootStackParamList = {
  Main: undefined;
  Post: undefined;
  TimePostOffice: undefined;
  TreeHole: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const [activeTab, setActiveTab] = React.useState('home');

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    // 处理不同tab的导航逻辑
    switch (tabId) {
      case 'home':
        // 已在首页
        break;
      case 'treehole':
        // 导航到树洞页面
        break;
      case 'soul':
        // 灵魂按钮 - 打开发布页面
        break;
      case 'messages':
        // 导航到消息页面
        break;
      case 'profile':
        // 导航到个人页面
        break;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // 隐藏默认tab栏
        }}
      >
        <Tab.Screen name="Home" component={MainScreen} />
        {/* 可以添加更多tab页面 */}
      </Tab.Navigator>
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Post" component={PostScreen} />
        <Stack.Screen name="TimePostOffice" component={TimePostOfficeScreen} />
        {/* 可以添加更多页面 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};