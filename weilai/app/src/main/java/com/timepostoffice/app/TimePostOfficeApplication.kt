package com.timepostoffice.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class TimePostOfficeApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // 初始化配置将在后续步骤中添加
    }
}