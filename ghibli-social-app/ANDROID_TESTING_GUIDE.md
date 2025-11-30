# Android Studio 安装和测试指南

## 1. 环境准备

### 检查Android Studio安装
确保Android Studio已正确安装，并且包含：
- Android SDK
- Android Virtual Device (AVD)
- Android SDK Platform-Tools

### 配置环境变量
```bash
# 检查Android SDK路径
echo %ANDROID_HOME%
echo %ANDROID_SDK_ROOT%
```

## 2. 连接设备

### 物理设备连接
1. 启用开发者选项
2. 启用USB调试
3. 连接USB线缆
4. 授权调试权限

### 虚拟设备创建
1. 打开Android Studio
2. 点击"Device Manager"
3. 创建新的虚拟设备
4. 选择设备型号和系统镜像
5. 启动虚拟设备

## 3. 构建和安装

### 方法一：使用Expo CLI
```bash
# 启动开发服务器
npm run android

# 如果端口被占用，使用备用端口
expo start --android --port 8083
```

### 方法二：使用React Native CLI
```bash
# 构建APK
cd android
./gradlew assembleDebug

# 安装到设备
./gradlew installDebug
```

### 方法三：使用Android Studio
1. 打开Android Studio
2. 选择"Open an Existing Project"
3. 导航到`ghibli-social-app/android`目录
4. 等待Gradle同步完成
5. 点击"Run"按钮或按Shift+F10

## 4. 验证安装

### 检查设备连接
```bash
# 查看连接的设备
adb devices

# 输出示例：
# List of devices attached
# emulator-5554   device
# ABCD12345678    device
```

### 应用安装验证
```bash
# 检查应用是否安装
adb shell pm list packages | findstr ghibli

# 启动应用
adb shell monkey -p com.ugly.ghiblisocialapp -c android.intent.category.LAUNCHER 1
```

## 5. 测试3D球体界面

### 基本功能测试
1. 启动应用后选择"🌐 灵魂星球"或"📱 Android 3D球体"
2. 观察3D球体是否正确渲染
3. 测试触摸旋转功能
4. 测试双指缩放功能
5. 点击球面上的节点

### 性能测试
- 检查FPS是否稳定（应该在50-60fps）
- 观察内存使用情况
- 测试长时间运行的稳定性

### 兼容性测试
- 不同Android版本（Android 8.0+）
- 不同屏幕尺寸
- 不同硬件配置

## 6. 常见问题解决

### 问题1：设备未识别
```bash
# 重启ADB服务
adb kill-server
adb start-server

# 检查驱动程序（Windows）
# 在设备管理器中查看是否有未知设备
```

### 问题2：构建失败
```bash
# 清理构建缓存
cd android
./gradlew clean

# 重新安装node_modules
cd ..
rm -rf node_modules
npm install
```

### 问题3：应用崩溃
```bash
# 查看日志
adb logcat | findstr ReactNative
adb logcat | findstr AndroidRuntime
```

### 问题4：3D渲染问题
- 检查设备是否支持OpenGL ES 3.0
- 确保有足够的GPU内存
- 尝试降低渲染质量

## 7. 性能优化建议

### 针对Android设备
1. **降低节点数量**：从24个减少到16个
2. **简化几何体**：使用更少的面数
3. **关闭抗锯齿**：提高渲染性能
4. **降低纹理质量**：使用纯色而非纹理

### 内存管理
1. **及时释放资源**：组件卸载时清理
2. **对象池复用**：避免频繁创建销毁
3. **懒加载**：按需加载3D资源

## 8. 测试用例

### 功能测试
- ✅ 应用正常启动
- ✅ 主菜单显示正确
- ✅ 3D球体界面加载
- ✅ 节点点击响应
- ✅ 触摸旋转功能
- ✅ 双指缩放功能
- ✅ 返回按钮功能

### 性能测试
- ✅ 启动时间 < 3秒
- ✅ FPS > 45帧
- ✅ 内存占用 < 200MB
- ✅ CPU占用 < 60%

### 兼容性测试
- ✅ Android 8.0+
- ✅ 不同屏幕密度
- ✅ 横竖屏切换
- ✅ 后台恢复

## 9. 打包发布

### 生成发布版本
```bash
# 生成签名APK
cd android
./gradlew assembleRelease

# 输出路径
# android/app/build/outputs/apk/release/app-release.apk
```

### 安装发布版本
```bash
# 安装APK
adb install app-release.apk
```

## 10. 监控和调试

### 实时监控
```bash
# CPU和内存监控
adb shell top -p $(adb shell pidof com.ugly.ghiblisocialapp)

# GPU渲染分析
adb shell dumpsys gfxinfo com.ugly.ghiblisocialapp
```

### 日志收集
```bash
# 保存日志到文件
adb logcat -d > android_log.txt
```

---

💡 **提示**：
1. 建议在物理设备上测试，性能更真实
2. 使用Android Studio的Profiler工具进行性能分析
3. 测试不同网络环境下的表现
4. 关注电池消耗情况

🚀 **现在你可以开始在Android Studio中测试3D球体界面了！**