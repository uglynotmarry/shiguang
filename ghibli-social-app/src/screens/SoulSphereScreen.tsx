import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import SoulSphereApp from '../components/SoulSphere3D/SoulSphereApp';

// 3D球体社交界面主屏幕
const SoulSphereScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0a0a0a" 
        translucent={false}
      />
      
      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>🌐 灵魂星球</Text>
        <Text style={styles.subtitle}>探索宇宙中的灵魂共鸣</Text>
      </View>
      
      {/* 3D球体主界面 */}
      <View style={styles.sphereContainer}>
        <SoulSphereApp />
      </View>
      
      {/* 底部说明 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 提示：点击球面上的灵魂节点查看内容{'\n'}
          🤏 双指缩放 • 👆 单指旋转浏览
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(125, 211, 192, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7DD3C0',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  sphereContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  footer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(125, 211, 192, 0.3)',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SoulSphereScreen;