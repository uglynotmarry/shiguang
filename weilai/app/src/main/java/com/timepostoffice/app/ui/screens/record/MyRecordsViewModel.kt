package com.timepostoffice.app.ui.screens.record

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timepostoffice.app.data.model.TimeRecord
import com.timepostoffice.app.data.repository.TimeRecordRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MyRecordsViewModel @Inject constructor(
    private val timeRecordRepository: TimeRecordRepository
) : ViewModel() {
    
    private val _myRecords = MutableStateFlow<List<TimeRecord>>(emptyList())
    val myRecords: StateFlow<List<TimeRecord>> = _myRecords.asStateFlow()
    
    fun loadMyRecords() {
        viewModelScope.launch {
            try {
                val records = timeRecordRepository.getMyRecords()
                _myRecords.value = records
            } catch (e: Exception) {
                _myRecords.value = emptyList()
            }
        }
    }
}