package com.timepostoffice.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import androidx.core.content.ContextCompat
import androidx.navigation.compose.rememberNavController
import com.timepostoffice.app.ui.navigation.TimePostOfficeApp
import com.timepostoffice.app.ui.theme.TimePostOfficeTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import com.timepostoffice.app.data.repository.AuthRepository

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    @Inject
    lateinit var authRepository: AuthRepository
    
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.all { it.value }
        if (allGranted) {
            // 权限已授予，继续正常流程
            setupApp()
        } else {
            // 权限被拒绝，显示错误信息或退出应用
            finish()
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 检查必要权限
        if (checkRequiredPermissions()) {
            setupApp()
        } else {
            requestRequiredPermissions()
        }
    }
    
    private fun checkRequiredPermissions(): Boolean {
        val requiredPermissions = arrayOf(
            Manifest.permission.RECORD_AUDIO
        )

        return requiredPermissions.all { permission ->
            ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
        }
    }

    private fun requestRequiredPermissions() {
        val requiredPermissions = arrayOf(
            Manifest.permission.RECORD_AUDIO
        )

        requestPermissionLauncher.launch(requiredPermissions)
    }
    
    private fun setupApp() {
        setContent {
            TimePostOfficeTheme {
                TimePostOfficeApp(authRepository = authRepository)
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    TimePostOfficeTheme {
        // 预览界面
    }
}
