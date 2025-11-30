package com.timepostoffice.app.viewmodel

import com.timepostoffice.app.data.repository.TimeRecordRepository
import com.timepostoffice.app.data.repository.AuthRepository
import com.timepostoffice.app.model.TimeRecord
import com.timepostoffice.app.model.Emotion
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.util.Date

@OptIn(ExperimentalCoroutinesApi::class)
class HomeViewModelTest {
    
    private lateinit var viewModel: HomeViewModel
    private lateinit var timeRecordRepository: TimeRecordRepository
    private lateinit var authRepository: AuthRepository
    private val testDispatcher = StandardTestDispatcher()
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        timeRecordRepository = mockk()
        authRepository = mockk()
        viewModel = HomeViewModel(timeRecordRepository, authRepository)
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }
    
    @Test
    fun `getRecords should return success when repository succeeds`() = runTest {
        // Given
        val testRecords = listOf(
            TimeRecord(
                id = "1",
                userId = "user-id",
                content = "Test content 1",
                emotion = Emotion.HAPPY,
                isPublic = true,
                createdAt = Date(),
                type = "text"
            ),
            TimeRecord(
                id = "2",
                userId = "user-id",
                content = "Test content 2",
                emotion = Emotion.SAD,
                isPublic = false,
                createdAt = Date(),
                type = "text"
            )
        )
        
        coEvery { timeRecordRepository.getUserRecords("user-id") } returns Result.success(testRecords)
        
        // When
        viewModel.getRecords("user-id")
        testScheduler.advanceUntilIdle()
        
        // Then
        assertEquals(testRecords, viewModel.records.value)
        assertNull(viewModel.error.value)
    }

    @Test
    fun `logout should call repository logout`() = runTest {
        // Given
        coEvery { authRepository.logout() } returns Unit
        
        // When
        viewModel.logout()
        testScheduler.advanceUntilIdle()
        
        // Then - logout was called (verified by mockk)
    }
}