#!/bin/bash
# Android 设备连接和测试状态检查脚本

echo "🔍 Android 设备连接状态检查"
echo "============================"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

# 检查 ADB 是否可用
check_adb() {
    if command -v adb &> /dev/null; then
        print_status "ADB 工具已安装"
        adb version
    else
        print_error "ADB 工具未找到"
        print_info "请安装 Android SDK Platform Tools"
        return 1
    fi
}

# 检查连接的设备
check_devices() {
    print_header "\n📱 连接设备检查"
    
    local devices=$(adb devices -l | grep -v "List of devices" | grep -v "^$")
    
    if [ -z "$devices" ]; then
        print_error "未检测到连接的设备"
        print_info "请确保："
        print_info "1. Android 设备已通过 USB 连接"
        print_info "2. 设备已开启 USB 调试模式"
        print_info "3. 已授权电脑调试权限"
        return 1
    else
        print_status "检测到连接的设备："
        echo "$devices"
        
        # 检查设备状态
        while IFS= read -r line; do
            if [[ $line == *"device"* ]]; then
                device_id=$(echo $line | awk '{print $1}')
                print_info "设备 $device_id 状态：已连接并授权"
                
                # 获取设备详细信息
                print_info "设备信息："
                adb -s $device_id shell getprop ro.product.model
                adb -s $device_id shell getprop ro.build.version.release
                adb -s $device_id shell getprop ro.product.brand
                
            elif [[ $line == *"unauthorized"* ]]; then
                device_id=$(echo $line | awk '{print $1}')
                print_warning "设备 $device_id 未授权 - 请在设备上授权调试"
                
            elif [[ $line == *"offline"* ]]; then
                device_id=$(echo $line | awk '{print $1}')
                print_error "设备 $device_id 离线 - 请重新连接设备"
            fi
        done <<< "$devices"
    fi
}

# 检查 Metro bundler 状态
check_metro() {
    print_header "\n🚀 Metro Bundler 状态检查"
    
    # 检查端口占用情况
    if command -v netstat &> /dev/null; then
        local port_8081=$(netstat -an | grep -E ":8081.*LISTEN")
        local port_8082=$(netstat -an | grep -E ":8082.*LISTEN")
        
        if [ -n "$port_8081" ]; then
            print_warning "端口 8081 被占用 - Metro bundler 可能运行在 8082"
        fi
        
        if [ -n "$port_8082" ]; then
            print_status "端口 8082 正在使用 - Metro bundler 运行正常"
        else
            print_info "端口 8082 空闲 - 需要启动 Metro bundler"
        fi
    fi
}

# 检查 React Native 环境
check_rn_environment() {
    print_header "\n⚛️  React Native 环境检查"
    
    # 检查 Node.js
    if command -v node &> /dev/null; then
        print_status "Node.js 已安装: $(node --version)"
    else
        print_error "Node.js 未安装"
    fi
    
    # 检查 npm
    if command -v npm &> /dev/null; then
        print_status "npm 已安装: $(npm --version)"
    else
        print_error "npm 未安装"
    fi
    
    # 检查 React Native CLI
    if command -v npx &> /dev/null; then
        print_status "npx 已安装"
    else
        print_error "npx 未安装"
    fi
    
    # 检查项目依赖
    if [ -f "package.json" ]; then
        print_status "找到 package.json"
        
        # 检查关键依赖
        local deps=("react-native" "expo" "react-native-reanimated" "react-native-gesture-handler" "expo-linear-gradient")
        
        for dep in "${deps[@]}"; do
            if grep -q "$dep" package.json; then
                print_status "✓ $dep 依赖存在"
            else
                print_warning "⚠ $dep 依赖缺失"
            fi
        done
    else
        print_error "未找到 package.json - 请确保在项目根目录运行"
    fi
}

# 检查 Android 构建环境
check_android_build() {
    print_header "\n🤖 Android 构建环境检查"
    
    # 检查 Java
    if command -v java &> /dev/null; then
        print_status "Java 已安装: $(java -version 2>&1 | head -n 1)"
    else
        print_error "Java 未安装 - 需要安装 JDK 11+"
    fi
    
    # 检查 Android SDK
    if [ -n "$ANDROID_HOME" ] || [ -n "$ANDROID_SDK_ROOT" ]; then
        print_status "Android SDK 环境变量已设置"
        echo "ANDROID_HOME: ${ANDROID_HOME:-未设置}"
        echo "ANDROID_SDK_ROOT: ${ANDROID_SDK_ROOT:-未设置}"
    else
        print_warning "Android SDK 环境变量未设置"
        print_info "请设置 ANDROID_HOME 或 ANDROID_SDK_ROOT"
    fi
    
    # 检查 Android 项目结构
    if [ -d "android" ]; then
        print_status "Android 项目目录存在"
        
        if [ -f "android/build.gradle" ]; then
            print_status "✓ Android 项目构建文件存在"
        else
            print_warning "⚠ Android 项目构建文件缺失"
        fi
    else
        print_info "Android 项目目录不存在 - 需要运行预构建"
    fi
}

# 性能测试建议
performance_recommendations() {
    print_header "\n⚡ 性能测试建议"
    
    print_info "设备性能检查："
    print_info "• CPU: 建议 4核+，确保动画流畅"
    print_info "• 内存: 建议 4GB+，避免内存不足"
    print_info "• GPU: 检查是否支持硬件加速"
    print_info "• 存储: 确保有足够空间 (2GB+)"
    
    print_info "\n动画性能优化："
    print_info "• 使用硬件加速 (Hardware Acceleration)"
    print_info "• 减少过度绘制 (Overdraw)"
    print_info "• 优化粒子效果数量"
    print_info "• 使用原生驱动动画"
    
    print_info "\n测试环境建议："
    print_info "• 关闭后台应用，释放内存"
    print_info "• 关闭省电模式，确保性能"
    print_info "• 使用真机测试，模拟器可能性能不足"
    print_info "• 清理设备缓存，避免干扰"
}

# 测试功能清单
test_checklist() {
    print_header "\n📋 SoulPickupAnimation 测试清单"
    
    print_info "核心功能测试："
    echo "☐ 长按 800ms 触发机制"
    echo "☐ 粒子动画效果"
    echo "☐ 光晕效果"
    echo "☐ 情绪色彩方案 (6种)"
    echo "☐ 动画取消机制"
    echo "☐ 性能流畅度 (60 FPS)"
    
    print_info "\n用户体验测试："
    echo "☐ 触摸响应时间 (<100ms)"
    echo "☐ 动画加载速度"
    echo "☐ 色彩识别度"
    echo "☐ 整体美观度"
    echo "☐ 女性用户友好度"
    
    print_info "\n兼容性测试："
    echo "☐ 不同 Android 版本 (API 24+)"
    echo "☐ 各种屏幕尺寸"
    echo "☐ 横竖屏切换"
    echo "☐ 深色模式"
}

# 主函数
main() {
    echo "开始 Android 测试环境检查..."
    echo "================================"
    
    check_adb
    check_devices
    check_metro
    check_rn_environment
    check_android_build
    performance_recommendations
    test_checklist
    
    print_header "\n🎯 测试准备完成！"
    print_status "环境检查通过，可以开始 Android 设备测试"
    
    print_info "\n下一步操作："
    print_info "1. 确保 Metro bundler 正在运行"
    print_info "2. 在设备上打开应用"
    print_info "3. 按照测试指南进行功能验证"
    print_info "4. 记录测试结果和发现的问题"
    
    print_warning "\n遇到问题？尝试："
    print_warning "• 重新连接设备"
    print_warning "• 重启 Metro bundler"
    print_warning "• 清除构建缓存"
    print_warning "• 检查依赖版本"
}

# 运行主函数
main