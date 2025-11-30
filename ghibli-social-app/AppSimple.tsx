import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// 简化的主菜单 - 直接集成3D球体界面
const MainMenu = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌐 灵魂星球</Text>
        <Text style={styles.subtitle}>Android 3D球体社交界面</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => navigation.navigate('SoulSphereAndroid')}
        >
          <Text style={styles.buttonText}>🚀 启动3D球体界面</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('TestScreen')}
        >
          <Text style={styles.buttonText}>🎭 测试灵魂拾取动画</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 点击启动3D球体界面，体验触摸旋转和缩放功能
        </Text>
      </View>
    </View>
  );
};

// 简化的应用主组件
const App = () => {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="MainMenu"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0a0a0a',
          },
          headerTintColor: '#7DD3C0',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="MainMenu" 
          component={MainMenu}
          options={{ 
            title: '主菜单',
            headerShown: false
          }}
        />
        
        {/* 导入现有的屏幕组件 */}
        {(() => {
          try {
            const TestScreen = require('./src/screens/TestScreen').default;
            const SoulSphereAndroidScreen = require('./src/screens/SoulSphereAndroidScreen').default;
            
            return (
              <>
                <Stack.Screen 
                  name="TestScreen" 
                  component={TestScreen}
                  options={{ title: '灵魂拾取测试' }}
                />
                <Stack.Screen 
                  name="SoulSphereAndroid" 
                  component={SoulSphereAndroidScreen}
                  options={{ title: '3D球体界面' }}
                />
              </>
            );
          } catch (error) {
            console.warn('某些屏幕组件加载失败:', error);
            return null;
          }
        })()}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7DD3C0',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
  },
  mainButton: {
    backgroundColor: 'rgba(125, 211, 192, 0.2)',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 30,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#7DD3C0',
    width: '100%',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(252, 70, 107, 0.2)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FC466B',
    width: '90%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default App;