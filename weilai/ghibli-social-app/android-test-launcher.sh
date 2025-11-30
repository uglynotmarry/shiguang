#!/bin/bash
# Android 测试启动脚本
# 专为 SoulPickupAnimation 组件测试优化

echo "🚀 启动宫崎骏赛博朋克社交应用 - Android 测试模式"
echo "=================================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# 检查环境
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# 检查 Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    print_error "npm 未安装，请先安装 npm"
    exit 1
fi

# 检查 React Native CLI
if ! command -v npx &> /dev/null; then
    print_error "npx 未安装，请先安装 npx"
    exit 1
fi

print_status "环境检查通过"

# 显示测试菜单
print_header "\n🎮 Android 测试选项"
echo -e "${CYAN}1.${NC} 启动完整应用测试"
echo -e "${CYAN}2.${NC} 仅测试 SoulPickupAnimation 组件"
echo -e "${CYAN}3.${NC} 仅测试时光邮局功能"
echo -e "${CYAN}4.${NC} 性能基准测试"
echo -e "${CYAN}5.${NC} 调试模式启动"
echo -e "${CYAN}6.${NC} 清除缓存并重启"
echo -e "${CYAN}7.${NC} 查看测试文档"

read -p "请选择测试模式 (1-7): " choice

case $choice in
    1)
        print_info "启动完整应用测试模式..."
        print_info "测试内容包括："
        print_info "• SoulPickupAnimation 动画效果"
        print_info "• 时光邮局功能"
        print_info "• 瀑布流布局"
        print_info "• 语音录制播放"
        print_info "• 宫崎骏+赛博朋克UI效果"
        
        print_warning "请确保："
        print_warning "• Android 设备已连接或模拟器已启动"
        print_warning "• 设备已开启 USB 调试模式"
        print_warning "• Metro bundler 端口未被占用"
        
        print_status "正在启动 Metro bundler..."
        npx expo start --android
        ;;
        
    2)
        print_info "启动 SoulPickupAnimation 专项测试..."
        print_info "测试重点："
        print_info "• 长按800ms触发机制"
        print_info "• 粒子动画效果"
        print_info "• 光晕效果"
        print_info "• 情绪色彩方案"
        print_info "• 不同情绪类型的动画表现"
        
        print_warning "测试方法："
        print_warning "• 长按测试卡片 800ms"
        print_warning "• 观察粒子扩散效果"
        print_warning "• 验证不同情绪的色彩变化"
        print_warning "• 测试动画取消机制"
        
        print_status "正在启动专项测试模式..."
        npx expo start --android
        ;;
        
    3)
        print_info "启动时光邮局功能测试..."
        print_info "测试内容："
        print_info "• 时间胶囊创建"
        print_info "• 定时发送功能"
        print_info "• 收件人选择"
        print_info "• 投递时间设置"
        print_info "• 信封预览效果"
        
        print_warning "操作步骤："
        print_warning "1. 点击底部导航栏 + 按钮"
        print_warning "2. 输入测试内容"
        print_warning "3. 启用时光邮局功能"
        print_warning "4. 选择投递时间和收件人"
        print_warning "5. 预览时光胶囊效果"
        
        print_status "正在启动时光邮局测试..."
        npx expo start --android
        ;;
        
    4)
        print_info "启动性能基准测试..."
        print_info "测试指标："
        print_info "• 动画流畅度 (目标: 60 FPS)"
        print_info "• 内存使用情况"
        print_info "• 电池消耗"
        print_info "• 启动时间"
        print_info "• 响应延迟"
        
        print_warning "测试方法："
        print_warning "• 连续触发动画100次"
        print_warning "• 监控内存变化"
        print_warning "• 记录帧率数据"
        print_warning "• 测试不同设备表现"
        
        print_status "正在启动性能测试..."
        npx expo start --android --no-dev --minify
        ;;
        
    5)
        print_info "启动调试模式..."
        print_info "调试功能："
        print_info "• Flipper 调试工具"
        print_info "• React DevTools"
        print_info "• 性能分析器"
        print_info "• 网络请求监控"
        print_info "• 控制台日志"
        
        print_warning "调试建议："
        print_warning "• 连接 Flipper 查看详细日志"
        print_warning "• 使用 React DevTools 检查组件状态"
        print_warning "• 监控性能指标"
        print_warning "• 查看网络请求"
        
        print_status "正在启动调试模式..."
        npx expo start --android --dev-client
        ;;
        
    6)
        print_info "清除缓存并重启..."
        print_warning "正在清除缓存，这可能需要一些时间..."
        
        print_status "清除 Metro 缓存..."
        npx react-native start --reset-cache
        
        print_status "清除 Gradle 缓存..."
        cd android && ./gradlew clean && cd ..
        
        print_status "重新安装依赖..."
        npm install
        
        print_status "重新构建 Android 项目..."
        npx expo prebuild --clean --platform android
        
        print_status "启动应用..."
        npx expo run:android
        ;;
        
    7)
        print_info "查看测试文档..."
        echo ""
        print_header "📚 可用测试文档："
        echo "• android-testing-guide.md - Android 综合测试指南"
        echo "• android-soul-pickup-test-guide.md - SoulPickupAnimation 专项测试"
        echo "• android-build-config.md - Android 构建配置"
        echo ""
        print_info "文档位置：项目根目录"
        print_info "建议使用 VS Code 或其他编辑器查看详细内容"
        ;;
        
    *)
        print_error "无效选择，请输入 1-7 之间的数字"
        exit 1
        ;;
esac

echo ""
print_header "🎉 Android 测试启动完成！"
print_info "测试提示："
print_info "• 观察应用启动过程"
print_info "• 关注控制台输出"
print_info "• 记录测试结果"
print_info "• 如有问题查看日志"

echo ""
print_warning "常见问题解决："
echo "• 端口冲突: npx expo start --port 8082"
echo "• 缓存问题: npx expo start --clear"
echo "• 构建失败: cd android && ./gradlew clean"
echo "• 依赖问题: npm install && npx expo prebuild --clean"

echo ""
print_status "享受测试过程！ 🚀✨"