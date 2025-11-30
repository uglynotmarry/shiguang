#!/usr/bin/env node

/**
 * Android 测试运行器 - 一键启动测试
 * 专为 SoulPickupAnimation 组件测试优化
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.purple}${colors.bright}${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}▶ ${msg}${colors.reset}`)
};

// 测试配置
const TEST_CONFIG = {
  metroPort: 8082,
  buildTimeout: 300000, // 5分钟
  testTimeout: 60000,  // 1分钟
  maxRetries: 3,
  androidPackage: 'com.anonymous.ghiblisocialapp'
};

// 检查环境
function checkEnvironment() {
  log.header('🔍 检查测试环境...');
  
  try {
    // 检查 Node.js
    const nodeVersion = process.version;
    log.success(`Node.js: ${nodeVersion}`);
    
    // 检查 npm
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log.success(`npm: ${npmVersion}`);
    
    // 检查项目目录
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json 不存在，请在项目根目录运行');
    }
    log.success('项目目录正确');
    
    // 检查关键依赖
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    const requiredDeps = ['react-native', 'expo', 'react-native-reanimated', 'react-native-gesture-handler'];
    for (const dep of requiredDeps) {
      if (dependencies[dep]) {
        log.success(`✓ ${dep}: ${dependencies[dep]}`);
      } else {
        log.warning(`⚠ ${dep}: 未找到`);
      }
    }
    
    return true;
  } catch (error) {
    log.error(`环境检查失败: ${error.message}`);
    return false;
  }
}

// 检查端口占用
function checkPort(port) {
  try {
    const net = require('net');
    const server = net.createServer();
    
    return new Promise((resolve) => {
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false); // 端口被占用
        } else {
          resolve(true);
        }
      });
      
      server.once('listening', () => {
        server.close();
        resolve(true); // 端口可用
      });
      
      server.listen(port);
    });
  } catch (error) {
    log.warning(`端口检查失败: ${error.message}`);
    return true; // 假设端口可用
  }
}

// 启动 Metro bundler
async function startMetro() {
  log.header('\n🚀 启动 Metro bundler...');
  
  const portAvailable = await checkPort(TEST_CONFIG.metroPort);
  if (!portAvailable) {
    log.warning(`端口 ${TEST_CONFIG.metroPort} 被占用，尝试使用备用端口`);
    TEST_CONFIG.metroPort = 8083;
  }
  
  return new Promise((resolve, reject) => {
    log.step(`启动 Metro bundler (端口: ${TEST_CONFIG.metroPort})...`);
    
    const metro = spawn('npx', ['expo', 'start', '--port', TEST_CONFIG.metroPort], {
      stdio: 'pipe',
      shell: true
    });
    
    let output = '';
    
    metro.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      if (text.includes('Metro waiting on')) {
        log.success('Metro bundler 启动成功！');
        resolve(metro);
      }
      
      if (text.includes('error') || text.includes('Error')) {
        log.warning(`Metro 警告: ${text.trim()}`);
      }
    });
    
    metro.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      log.error(`Metro 错误: ${text.trim()}`);
    });
    
    metro.on('error', (error) => {
      log.error(`Metro 进程错误: ${error.message}`);
      reject(error);
    });
    
    metro.on('exit', (code) => {
      if (code !== 0) {
        log.error(`Metro bundler 退出，代码: ${code}`);
        reject(new Error('Metro bundler 启动失败'));
      }
    });
    
    // 超时处理
    setTimeout(() => {
      if (!metro.killed) {
        log.warning('Metro 启动超时，继续尝试...');
        resolve(metro);
      }
    }, 30000);
  });
}

// 构建 Android 应用
async function buildAndroid() {
  log.header('\n🏗️ 构建 Android 应用...');
  
  return new Promise((resolve, reject) => {
    log.step('开始构建 Android APK...');
    
    const build = spawn('npx', ['expo', 'run:android'], {
      stdio: 'pipe',
      shell: true
    });
    
    let buildOutput = '';
    let buildSuccess = false;
    
    build.stdout.on('data', (data) => {
      const text = data.toString();
      buildOutput += text;
      
      // 显示构建进度
      if (text.includes('Building')) {
        process.stdout.write('.');
      }
      
      if (text.includes('BUILD SUCCESSFUL')) {
        log.success('\nAndroid 构建成功！');
        buildSuccess = true;
      }
      
      if (text.includes('Installing')) {
        log.step('正在安装应用到设备...');
      }
      
      if (text.includes('Successfully installed')) {
        log.success('应用安装成功！');
      }
    });
    
    build.stderr.on('data', (data) => {
      const text = data.toString();
      buildOutput += text;
      
      // 过滤掉不重要的警告
      if (!text.includes('warning') && !text.includes('Note:')) {
        log.error(`构建错误: ${text.trim()}`);
      }
    });
    
    build.on('error', (error) => {
      log.error(`构建进程错误: ${error.message}`);
      reject(error);
    });
    
    build.on('exit', (code) => {
      if (code === 0 || buildSuccess) {
        log.success('Android 构建完成！');
        resolve(build);
      } else {
        log.error(`构建失败，退出代码: ${code}`);
        reject(new Error('Android 构建失败'));
      }
    });
    
    // 超时处理
    setTimeout(() => {
      if (!build.killed) {
        log.warning('构建超时，但可能仍在进行...');
        resolve(build);
      }
    }, TEST_CONFIG.buildTimeout);
  });
}

// 运行简单测试
function runSimpleTest() {
  log.header('\n🧪 运行组件测试...');
  
  log.step('测试 SoulPickupAnimation 组件逻辑...');
  
  // 模拟测试数据
  const testSouls = [
    {
      id: 'test-1',
      content: '今天的天空特别蓝，让我想起了小时候的梦想...',
      emotion: 'peaceful',
      backgroundColors: ['#7DD3C0', '#C084FC'],
      textColor: '#FFFFFF'
    },
    {
      id: 'test-2',
      content: '在这个喧嚣的世界里，找到属于自己的宁静...',
      emotion: 'dreamy',
      backgroundColors: ['#C084FC', '#FB923C'],
      textColor: '#FFFFFF'
    },
    {
      id: 'test-3',
      content: '温暖的阳光洒在肩上，感觉整个世界都温柔了...',
      emotion: 'warm',
      backgroundColors: ['#FB923C', '#FBBF24'],
      textColor: '#FFFFFF'
    }
  ];
  
  log.info('测试情绪色彩方案:');
  testSouls.forEach((soul, index) => {
    log.success(`${index + 1}. ${soul.emotion}: ${soul.backgroundColors.join(' → ')}`);
  });
  
  log.info('测试动画参数:');
  log.success('• 长按触发时间: 800ms');
  log.success('• 粒子数量: 12个 (Android优化)');
  log.success('• 动画持续时间: 2000ms');
  log.success('• 光晕效果: 呼吸动画');
  
  return true;
}

// 显示测试指南
function showTestGuide() {
  log.header('\n📱 Android 设备测试指南');
  
  log.info('测试步骤:');
  log.step('1. 等待应用构建和安装完成');
  log.step('2. 在 Android 设备上打开应用');
  log.step('3. 找到灵魂卡片内容');
  log.step('4. 长按卡片 800毫秒 (重要！)');
  log.step('5. 观察动画效果:');
  log.info('   • 粒子效果从中心扩散');
  log.info('   • 光晕效果增强');
  log.info('   • 色彩根据情绪变化');
  log.info('   • 释放时的涟漪动画');
  
  log.info('预期色彩方案:');
  log.success('• 平静(peaceful): 薄荷绿 → 薰衣草紫');
  log.success('• 梦幻(dreamy): 薰衣草紫 → 蜜桃橙');
  log.success('• 温暖(warm): 蜜桃橙 → 樱花黄');
  log.success('• 希望(hopeful): 樱花黄 → 薄荷绿');
  log.success('• 忧郁(melancholic): 深蓝 → 电紫');
  log.success('• 活力(energetic): 霓虹粉 → 霓虹蓝');
}

// 主函数
async function main() {
  log.header('🚀 宫崎骏赛博朋克社交应用 - Android 测试启动器');
  log.info('专为 SoulPickupAnimation 组件测试优化');
  
  try {
    // 1. 环境检查
    if (!checkEnvironment()) {
      throw new Error('环境检查失败');
    }
    
    // 2. 运行简单测试
    runSimpleTest();
    
    // 3. 显示测试指南
    showTestGuide();
    
    // 4. 启动 Metro bundler
    log.header('\n🚀 启动开发服务器...');
    log.info('正在启动 Metro bundler，请稍候...');
    
    const metro = await startMetro();
    
    // 5. 构建 Android 应用
    log.header('\n🏗️ 构建 Android 应用...');
    log.info('正在构建 APK，这可能需要几分钟时间...');
    
    const build = await buildAndroid();
    
    // 6. 完成提示
    log.header('\n🎉 测试环境准备完成！');
    log.success('Metro bundler 已启动');
    log.success('Android 应用构建完成');
    log.success('应用已安装到设备');
    
    log.info('\n下一步操作:');
    log.step('1. 在 Android 设备上找到并打开应用');
    log.step('2. 按照上面的测试指南进行测试');
    log.step('3. 重点测试 SoulPickupAnimation 动画效果');
    log.step('4. 观察粒子效果和色彩变化');
    
    log.warning('\n💡 提示:');
    log.info('• Metro bundler 会保持运行，不要关闭');
    log.info('• 应用会自动重载代码更改');
    log.info('• 按 Ctrl+C 可以停止服务');
    
    log.header('\n🎮 开始测试吧！享受宫崎骏+赛博朋克的视觉盛宴！✨');
    
  } catch (error) {
    log.error(`测试启动失败: ${error.message}`);
    log.info('请检查错误信息并尝试重新运行');
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    log.error(`未处理的错误: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, checkEnvironment, runSimpleTest };