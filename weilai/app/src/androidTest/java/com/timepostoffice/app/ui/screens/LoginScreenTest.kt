package com.timepostoffice.app.ui.screens

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class LoginScreenTest {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun loginScreen_shouldDisplayAllElements() {
        // Given
        var loginClicked = false
        var registerClicked = false
        
        // When
        composeTestRule.setContent {
            LoginScreen(
                onLoginClick = { _, _ -> loginClicked = true },
                onRegisterClick = { registerClicked = true }
            )
        }
        
        // Then
        composeTestRule.onNodeWithText("时光邮局").assertExists()
        composeTestRule.onNodeWithText("登录").assertExists()
        composeTestRule.onNodeWithText("还没有账号？注册").assertExists()
        
        // Test login button click
        composeTestRule.onNodeWithText("登录").performClick()
        assert(loginClicked)
        
        // Test register button click
        composeTestRule.onNodeWithText("还没有账号？注册").performClick()
        assert(registerClicked)
    }
    
    @Test
    fun loginScreen_shouldValidateInput() {
        // Given
        var loginAttempted = false
        
        // When
        composeTestRule.setContent {
            LoginScreen(
                onLoginClick = { _, _ -> loginAttempted = true },
                onRegisterClick = {}
            )
        }
        
        // Then
        // Try to login with empty fields
        composeTestRule.onNodeWithText("登录").performClick()
        
        // Should not attempt login with empty fields
        assert(!loginAttempted)
    }
    
    @Test
    fun loginScreen_shouldAcceptEmailAndPassword() {
        // Given
        val testEmail = "test@example.com"
        val testPassword = "password123"
        var capturedEmail = ""
        var capturedPassword = ""
        
        // When
        composeTestRule.setContent {
            LoginScreen(
                onLoginClick = { email, password ->
                    capturedEmail = email
                    capturedPassword = password
                },
                onRegisterClick = {}
            )
        }
        
        // Then
        // Find text fields and enter values
        composeTestRule.onAllNodesWithTag("TextField").apply {
            // Email field
            get(0).performTextInput(testEmail)
            // Password field
            get(1).performTextInput(testPassword)
        }
        
        // Click login
        composeTestRule.onNodeWithText("登录").performClick()
        
        // Verify captured values
        assert(capturedEmail == testEmail)
        assert(capturedPassword