import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Animated } from 'react-native';

// 简化的3D球体界面 - 专为Android设备优化
const SimpleSoulSphereAndroid = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBtn}><Text style={styles.headerBtnText}>觅见</Text></TouchableOpacity>
          <View style={{ width: 60 }} />
          <TouchableOpacity style={styles.headerBtn}><Text style={styles.headerBtnText}>筛选</Text></TouchableOpacity>
        </View>
      </View>
      
      <ScatterArea />
      
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navIcon}>🌳</Text><Text style={styles.navText}>tree hole</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navIcon}>🌲</Text><Text style={styles.navText}>森林</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navCenter}><Text style={styles.navCenterText}>灵魂</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navIcon}>👤</Text><Text style={styles.navText}>future self</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(125, 211, 192, 0.3)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerBtnText: {
    color: '#ffffff',
    fontSize: 12,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  sphereContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  sphere: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(26, 26, 46, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(125, 211, 192, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  node: {
    position: 'absolute',
    backgroundColor: 'rgba(125, 211, 192, 0.8)',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  nodeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // 节点位置 - 模拟球面分布
  node1: { top: 40, left: 80 },
  node2: { top: 80, right: 40 },
  node3: { top: 140, left: 40 },
  node4: { bottom: 80, right: 60 },
  node5: { bottom: 40, left: 60 },
  node6: { top: 180, right: 80 },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(125, 211, 192, 0.3)',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
    color: '#c9b6ff',
  },
  navText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  navCenter: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#a96cff',
    shadowColor: '#a96cff',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  navCenterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  bubbleText: {
    color: '#2a2a2a',
    fontSize: 11,
    fontWeight: '600'
  },
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.25)'
  }
});

function ScatterArea() {
  const [size, setSize] = useState({ w: Dimensions.get('window').width, h: Dimensions.get('window').height * 0.68 });
  const [items, setItems] = useState<{ id: string; x: number; y: number; text: string; color: string; }[]>([]);
  const colors = ['#ffd6e7', '#d6e7ff', '#ffe6b3', '#c6ffe6', '#e9d6ff', '#ffc3c3'];
  const texts = [
    '孤独且灿烂', '半夜捡来的蒲岛瓜', '人生如梦', '招架不住Mood', '那我呢', '山的那边是谁', 'dbhy', 'Hhhhh', '新人',
    '流年', '梨花家', '是绝美', 'i', '大G', 'Ty', '活泼开朗', '期待遇见', '想分享给你', '树洞里的秘密', '天空之城的梦'
  ];
  useEffect(() => {
    const arr: { id: string; x: number; y: number; text: string; color: string; }[] = [];
    const count = 56;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * (size.w - 80);
      const y = Math.random() * (size.h - 120) + 20;
      arr.push({ id: 'b' + i, x, y, text: texts[i % texts.length], color: colors[i % colors.length] });
    }
    setItems(arr);
  }, [size.w, size.h]);
  return (
    <View style={styles.sphereContainer} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <View style={{ flex: 1 }}>
        {items.map((it) => (
          <Animated.View key={it.id} style={[styles.bubble, { left: it.x, top: it.y, backgroundColor: it.color }]}> 
            <View style={[styles.bullet, { marginRight: 6 }]} />
            <Text style={styles.bubbleText}>{it.text}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

export default SimpleSoulSphereAndroid;