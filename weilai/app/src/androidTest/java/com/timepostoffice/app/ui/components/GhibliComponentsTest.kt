package com.timepostoffice.app.ui.components

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class GhibliComponentsTest {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun ghibliButton_shouldDisplayText() {
        // Given
        val buttonText = "Test Button"
        var clicked = false
        
        // When
        composeTestRule.setContent {
            GhibliButton(
                text = buttonText,
                onClick = { clicked = true }
            )
        }
        
        // Then
        composeTestRule.onNodeWithText(buttonText).assertExists()
        composeTestRule.onNodeWithText(buttonText).performClick()
        assert(clicked)
    }
    
    @Test
    fun ghibliOutlinedButton_shouldDisplayText() {
        // Given
        val buttonText = "Outlined Button"
        var clicked = false
        
        // When
        composeTestRule.setContent {
            GhibliOutlinedButton(
                text = buttonText,
                onClick = { clicked = true }
            )
        }
        
        // Then
        composeTestRule.onNodeWithText(buttonText).assertExists()
        composeTestRule.onNodeWithText(buttonText).performClick()
        assert(clicked)
    }
    
    @Test
    fun ghibliTextField_shouldAcceptInput() {
        // Given
        val initialValue = "Initial Text"
        var textValue = initialValue
        
        // When
        composeTestRule.setContent {
            GhibliTextField(
                value = textValue,
                onValueChange = { textValue = it },
                label = "Test Field"
            )
        }
        
        // Then
        composeTestRule.onNodeWithText("Test Field").assertExists()
        composeTestRule.onNodeWithText(initialValue).assertExists()
    }
    
    @Test
    fun ghibliTextField_shouldShowError() {
        // Given
        val errorMessage = "Error message"
        
        // When
        composeTestRule.setContent {
            GhibliTextField(
                value = "",
                onValueChange = {},
                label = "Test Field",
                error = errorMessage
            )
        }
        
        // Then
        composeTestRule.onNodeWithText(errorMessage).assertExists