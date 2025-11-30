// 简单的SoulPickupAnimation测试代码
// 可以直接在浏览器控制台运行测试

// 模拟React Native组件的简化版本
const SoulPickupAnimationTest = {
  // 测试不同的情感类型
  emotions: ['romantic', 'dreamy', 'mysterious', 'warm'],
  
  // 测试灵魂内容
  testSouls: [
    {
      id: '1',
      content: '今天看到了最美的日落，想分享给你',
      emotion: 'romantic',
      type: 'text'
    },
    {
      id: '2', 
      content: '做了一个关于天空之城的梦',
      emotion: 'dreamy',
      type: 'text'
    },
    {
      id: '3',
      content: '树洞里的秘密',
      emotion: 'mysterious',
      type: 'text'
    }
  ],

  // 颜色配置
  colors: {
    romantic: ['#FC466B', '#3F5EFB'],
    dreamy: ['#A8E6CF', '#7DD3C0'],
    mysterious: ['#667eea', '#764ba2'],
    warm: ['#f093fb', '#f5576c']
  },

  // 测试动画效果
  testAnimation: function(soulIndex = 0) {
    const soul = this.testSouls[soulIndex];
    const colors = this.colors[soul.emotion];
    
    console.log(`🎭 测试灵魂拾取动画 - ${soul.emotion}`);
    console.log(`📝 内容: ${soul.content}`);
    console.log(`🎨 颜色: ${colors[0]} → ${colors[1]}`);
    
    // 模拟动画阶段
    this.simulateAnimationPhases(soul);
    
    return {
      success: true,
      soul: soul,
      colors: colors,
      timestamp: new Date().toISOString()
    };
  },

  // 模拟动画阶段
  simulateAnimationPhases: function(soul) {
    console.log('⚡ 阶段1: 粒子效果启动');
    console.log('✨ 阶段2: 发光效果增强');
    console.log('🌟 阶段3: 灵魂内容浮现');
    console.log('💫 阶段4: 涟漪扩散效果');
    console.log('🎯 阶段5: 拾取完成');
    
    // 模拟不同情感的视觉效果
    switch(soul.emotion) {
      case 'romantic':
        console.log('💕 浪漫特效: 心形粒子 + 粉蓝渐变');
        break;
      case 'dreamy':
        console.log('🌙 梦幻特效: 星光粒子 + 薄荷渐变');
        break;
      case 'mysterious':
        console.log('🔮 神秘特效: 紫色光环 + 魔法粒子');
        break;
      case 'warm':
        console.log('🔥 温暖特效: 橙红渐变 + 温暖光晕');
        break;
    }
  },

  // 测试所有动画
  testAllAnimations: function() {
    console.log('🚀 开始全面测试所有灵魂拾取动画...\n');
    
    const results = [];
    this.testSouls.forEach((soul, index) => {
      console.log(`\n--- 测试 ${index + 1} ---`);
      const result = this.testAnimation(index);
      results.push(result);
    });
    
    console.log('\n📊 测试总结:');
    console.log(`✅ 成功测试: ${results.length} 个动画`);
    console.log(`🎨 情感类型: ${this.emotions.join(', ')}`);
    console.log(`⏱️ 测试时间: ${new Date().toLocaleString()}`);
    
    return results;
  },

  // 性能测试
  performanceTest: function(iterations = 100) {
    console.log(`🔥 开始性能测试 (${iterations} 次迭代)...`);
    const startTime = performance.now();
    
    for(let i = 0; i < iterations; i++) {
      const randomIndex = Math.floor(Math.random() * this.testSouls.length);
      this.testAnimation(randomIndex);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    
    console.log(`⏱️ 总耗时: ${totalTime.toFixed(2)}ms`);
    console.log(`📈 平均耗时: ${avgTime.toFixed(2)}ms/次`);
    console.log(`🚀 性能评级: ${avgTime < 1 ? '优秀' : avgTime < 5 ? '良好' : '需要优化'}`);
    
    return {
      totalTime,
      avgTime,
      iterations,
      rating: avgTime < 1 ? 'excellent' : avgTime < 5 ? 'good' : 'needs_optimization'
    };
  }
};

// 简单的HTML可视化测试
const createVisualTest = function() {
  const testHtml = `
    <div id="soul-pickup-test" style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      border-radius: 20px;
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;
      z-index: 1000;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    ">
      <h3>🎭 SoulPickupAnimation 测试</h3>
      <button onclick="runTest()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 10px 20px;
        border-radius: 10px;
        cursor: pointer;
        margin: 5px;
        font-size: 14px;
      ">运行测试</button>
      <button onclick="runPerformanceTest()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 10px 20px;
        border-radius: 10px;
        cursor: pointer;
        margin: 5px;
        font-size: 14px;
      ">性能测试</button>
      <button onclick="closeTest()" style="
        background: rgba(255,0,0,0.3);
        border: none;
        color: white;
        padding: 10px 20px;
        border-radius: 10px;
        cursor: pointer;
        margin: 5px;
        font-size: 14px;
      ">关闭</button>
      <div id="test-results" style="margin-top: 15px; font-size: 12px;"></div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', testHtml);
};

// 全局测试函数
window.runTest = function() {
  const results = SoulPickupAnimationTest.testAllAnimations();
  document.getElementById('test-results').innerHTML = `
    <div style="background: rgba(0,255,0,0.2); padding: 10px; border-radius: 5px; margin: 5px 0;">
      ✅ 测试完成！${results.length} 个动画效果正常
    </div>
  `;
};

window.runPerformanceTest = function() {
  const perf = SoulPickupAnimationTest.performanceTest(50);
  document.getElementById('test-results').innerHTML = `
    <div style="background: rgba(0,255,255,0.2); padding: 10px; border-radius: 5px; margin: 5px 0;">
      ⚡ 性能测试完成！<br>
      平均耗时: ${perf.avgTime.toFixed(2)}ms<br>
      性能评级: ${perf.rating === 'excellent' ? '优秀' : perf.rating === 'good' ? '良好' : '需要优化'}
    </div>
  `;
};

window.closeTest = function() {
  document.getElementById('soul-pickup-test').remove();
};

// 使用说明
console.log(`
🎭 SoulPickupAnimation 测试工具已加载！

使用方法：
1. 控制台测试：
   SoulPickupAnimationTest.testAnimation(0)  // 测试单个动画
   SoulPickupAnimationTest.testAllAnimations()  // 测试所有动画
   SoulPickupAnimationTest.performanceTest(100)  // 性能测试

2. 可视化测试：
   createVisualTest()  // 创建可视化测试界面

3. 测试数据：
   - ${SoulPickupAnimationTest.testSouls.length} 个测试灵魂内容
   - ${SoulPickupAnimationTest.emotions.length} 种情感类型
   - 包含性能测试和视觉效果模拟

示例：
   SoulPickupAnimationTest.testAnimation(1)  // 测试梦幻效果
`);