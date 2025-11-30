package com.timepostoffice.app.ui.screens.timeline

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timepostoffice.app.data.model.EmotionType
import com.timepostoffice.app.data.model.TimeRecord
import com.timepostoffice.app.data.repository.TimeRecordRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PublicTimelineViewModel @Inject constructor(
    private val timeRecordRepository: TimeRecordRepository
) : ViewModel() {
    
    private val _publicRecords = MutableStateFlow<List<TimeRecord>>(emptyList())
    val publicRecords: StateFlow<List<TimeRecord>> = _publicRecords.asStateFlow()
    
    fun loadPublicRecords(emotionFilter: EmotionType? = null) {
        viewModelScope.launch {
            try {
                val records = timeRecordRepository.getPublicRecords(emotionFilter)
                _publicRecords.value = records
            } catch (e: Exception) {
                _publicRecords.value = emptyList()
            }
        }
    }
}