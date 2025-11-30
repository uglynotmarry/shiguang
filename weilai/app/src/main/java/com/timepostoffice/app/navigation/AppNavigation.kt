package com.timepostoffice.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.timepostoffice.app.ui.screens.auth.LoginScreen
import com.timepostoffice.app.ui.screens.auth.RegisterScreen
import com.timepostoffice.app.ui.screens.main.HomeScreen
import com.timepostoffice.app.ui.screens.record.CreateRecordScreen
import com.timepostoffice.app.ui.screens.record.VoiceRecordScreen
import com.timepostoffice.app.ui.screens.subscription.SubscriptionScreen
import com.timepostoffice.app.ui.screens.timeline.PublicTimelineScreen

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
    object CreateRecord : Screen("create_record")
    object VoiceRecord : Screen("voice_record")
    object Subscription : Screen("subscription")
    object PublicTimeline : Screen("public_timeline")
}

@Composable
fun AppNavigation(
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Login.route
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onNavigateToRegister = {
                    navController.navigate(Screen.Register.route)
                },
                onLoginSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Register.route) {
            RegisterScreen(
                onNavigateToLogin = {
                    navController.popBackStack()
                },
                onRegisterSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToCreateRecord = {
                    navController.navigate(Screen.CreateRecord.route)
                },
                onNavigateToVoiceRecord = {
                    navController.navigate(Screen.VoiceRecord.route)
                },
                onNavigateToSubscription = {
                    navController.navigate(Screen.Subscription.route)
                },
                onNavigateToPublicTimeline = {
                    navController.navigate(Screen.PublicTimeline.route)
                }
            )
        }
        
        composable(Screen.CreateRecord.route) {
            CreateRecordScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(Screen.VoiceRecord.route) {
            VoiceRecordScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(Screen.Subscription.route) {
            SubscriptionScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(Screen.PublicTimeline.route) {
            PublicTimelineScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToRecordDetail = { _ ->
                    // Navigate to record detail screen
                    // For now, just show a placeholder
                }
            )
        }
    }
}