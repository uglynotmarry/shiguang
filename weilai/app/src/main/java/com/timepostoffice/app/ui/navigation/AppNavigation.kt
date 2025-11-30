package com.timepostoffice.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.timepostoffice.app.ui.screens.auth.LoginScreen
import com.timepostoffice.app.ui.screens.auth.RegisterScreen
import com.timepostoffice.app.ui.screens.main.HomeScreen
import com.timepostoffice.app.ui.screens.record.CreateRecordScreen
import com.timepostoffice.app.ui.screens.record.MyRecordsScreen
import com.timepostoffice.app.ui.screens.record.VoiceRecordScreen
import com.timepostoffice.app.ui.screens.subscription.SubscriptionScreen
import com.timepostoffice.app.ui.screens.timeline.PublicTimelineScreen

@Composable
fun AppNavigation(
    navController: NavHostController,
    startDestination: String = "login"
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // 认证相关
        composable("login") {
            LoginScreen(
                onNavigateToRegister = {
                    navController.navigate("register")
                },
                onLoginSuccess = {
                    navController.navigate("home") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        }
        
        composable("register") {
            RegisterScreen(
                onNavigateToLogin = {
                    navController.navigate("login") {
                        popUpTo("register") { inclusive = true }
                    }
                },
                onRegisterSuccess = {
                    navController.navigate("home") {
                        popUpTo("register") { inclusive = true }
                    }
                }
            )
        }
        
        // 主界面
        composable("home") {
            HomeScreen(
                onNavigateToCreateRecord = {
                    navController.navigate("create_text_record")
                },
                onNavigateToVoiceRecord = {
                    navController.navigate("create_voice_record")
                },
                onNavigateToPublicTimeline = {
                    navController.navigate("public_timeline")
                },
                onNavigateToSubscription = {
                    navController.navigate("subscription")
                }
            )
        }
        
        // 记录创建
        composable("create_text_record") {
            CreateRecordScreen(
                onNavigateBack = {
                    navController.navigateUp()
                }
            )
        }
        
        composable("create_voice_record") {
            VoiceRecordScreen(
                onNavigateBack = {
                    navController.navigateUp()
                }
            )
        }
        
        // 记录管理
        composable("my_records") {
            MyRecordsScreen(
                onNavigateBack = {
                    navController.navigateUp()
                },
                onNavigateToRecordDetail = { _ ->
                    // 这里可以导航到记录详情页面
                    // navController.navigate("record_detail/$recordId")
                }
            )
        }
        
        // 公共时间线
        composable("public_timeline") {
            PublicTimelineScreen(
                onNavigateBack = {
                    navController.navigateUp()
                },
                onNavigateToRecordDetail = { _ ->
                    // 这里可以导航到记录详情页面
                    // navController.navigate("record_detail/$recordId")
                }
            )
        }
        
        // 订阅管理
        composable("subscription") {
            SubscriptionScreen(
                onNavigateBack = {
                    navController.navigateUp()
                }
            )
        }
    }
}