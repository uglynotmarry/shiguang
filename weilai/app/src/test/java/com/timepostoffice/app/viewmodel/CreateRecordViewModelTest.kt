package com.timepostoffice.app.viewmodel

import com.timepostoffice.app.data.repository.TimeRecordRepository
import com.timepostoffice.app.model.TimeRecord
import com.timepostoffice.app.model.Emotion
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.util.Date

@OptIn(ExperimentalCoroutinesApi::class)
class CreateRecordViewModelTest {
    
    private lateinit var viewModel: CreateRecordViewModel
    private lateinit var timeRecordRepository: TimeRecordRepository
    private val testDispatcher = StandardTestDispatcher()
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        timeRecordRepository = mockk()
        viewModel = CreateRecordViewModel(timeRecordRepository)
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }
    
    @Test
    fun `createTextRecord should return success when repository succeeds`() = runTest {
        // Given
        val content = "Test content"
        val emotion = Emotion.HAPPY
        val isPublic = true
        val testRecord = TimeRecord(
            id = "test-id",
            userId = "user-id",
            content = content,
            emotion = emotion,
            isPublic = isPublic,
            createdAt = Date(),
            type = "text"
        )
        
        coEvery { 
            timeRecordRepository.createRecord(content, emotion, isPublic, null)
        } returns Result.success(testRecord)
        
        var result: Boolean? = null
        
        // When
        viewModel.createTextRecord(content, emotion, isPublic) { success ->
            result = success
        }
        testScheduler.advanceUntilIdle()
        
        // Then
        assertTrue(result ?: false)
    }

    @Test
    fun `createTextRecord should return failure when repository fails`() = runTest {
        // Given
        val content = "Test content"
        val emotion = Emotion.SAD
        val isPublic = false
        val exception = Exception("Network error")
        
        coEvery { 
            timeRecordRepository.createRecord(content, emotion, isPublic, null)
        } returns Result.failure(exception)
        
        var result: Boolean? = null
        
        // When
        viewModel.createTextRecord(content, emotion, isPublic) { success ->
            result = success
        }
        testScheduler.advanceUntilIdle()
        
        // Then
        assertFalse(result ?: true)
    }
}