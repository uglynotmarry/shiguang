package com.timepostoffice.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavHostController
import androidx.navigation.compose.rememberNavController
import com.timepostoffice.app.data.repository.AuthRepository
import com.timepostoffice.app.ui.screens.main.HomeScreen
import com.timepostoffice.app.ui.screens.auth.LoginScreen

@Composable
fun TimePostOfficeApp(
    authRepository: AuthRepository,
    navController: NavHostController = rememberNavController()
) {
    val authState by authRepository.authState.collectAsState()
    
    // 根据认证状态决定起始目的地
    val startDestination = when (authState) {
        is com.timepostoffice.app.data.model.AuthState.Authenticated -> "home"
        else -> "login"
    }
    
    AppNavigation(
        navController = navController,
        startDestination = startDestination
    )
}