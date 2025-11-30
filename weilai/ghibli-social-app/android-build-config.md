# Android 项目配置
# 确保在 Android Studio 中正确构建和运行

# 项目级 build.gradle 配置建议
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 24  # Android 7.0+ 确保动画性能
        compileSdkVersion = 34
        targetSdkVersion = 34
        
        # Kotlin 版本
        kotlinVersion = '1.8.0'
        
        # React Native 相关
        reactNativeVersion = "+"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath('com.android.tools.build:gradle:7.4.2')
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}

# 应用级 build.gradle 关键配置
android {
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "com.anonymous.ghiblisocialapp"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
        
        // 动画性能优化
        renderscriptTargetApi 21
        renderscriptSupportModeEnabled true
        
        // 内存优化
        multiDexEnabled true
        
        // 国际化支持
        resConfigs "en", "zh", "zh-rCN"
    }
    
    buildTypes {
        debug {
            // 调试配置
            debuggable true
            minifyEnabled false
            shrinkResources false
            
            // 动画调试
            buildConfigField "boolean", "ENABLE_ANIMATION_DEBUG", "true"
        }
        release {
            // 发布配置
            debuggable false
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            
            // 动画性能优化
            buildConfigField "boolean", "ENABLE_ANIMATION_DEBUG", "false"
        }
    }
    
    // 动画性能优化
    dexOptions {
        javaMaxHeapSize "4g"
        preDexLibraries = false
    }
    
    // 编译优化
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

# React Native 动画相关依赖
dependencies {
    implementation "com.facebook.react:react-native:+$reactNativeVersion"
    
    // 动画支持
    implementation 'com.facebook.fresco:animated-gif:2.5.0'
    implementation 'com.facebook.fresco:animated-webp:2.5.0'
    implementation 'com.facebook.fresco:webpsupport:2.5.0'
    
    // 手势处理
    implementation 'com.swmansion.gesturehandler:react-native-gesture-handler:+'
    
    // 渐变支持
    implementation 'com.facebook.fresco:fresco:2.5.0'
    implementation 'com.facebook.fresco:imagepipeline-base:2.5.0'
    
    // 性能监控
    debugImplementation 'com.facebook.flipper:flipper:0.182.0'
    debugImplementation 'com.facebook.flipper:flipper-network-plugin:0.182.0'
    debugImplementation 'com.facebook.flipper:flipper-fresco-plugin:0.182.0'
}

# ProGuard 规则 (android/app/proguard-rules.pro)
# 保持动画相关类
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-keep class expo.modules.lineargradient.** { *; }

# 保持 React Native 相关
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# 保持动画性能
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes EnclosingMethod