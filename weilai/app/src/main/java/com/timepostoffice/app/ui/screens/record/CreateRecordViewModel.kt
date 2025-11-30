package com.timepostoffice.app.ui.screens.record

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timepostoffice.app.data.model.EmotionType
import com.timepostoffice.app.data.model.RecordType
import com.timepostoffice.app.data.model.TimeRecord
import com.timepostoffice.app.data.repository.TimeRecordRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CreateRecordViewModel @Inject constructor(
    private val timeRecordRepository: TimeRecordRepository
) : ViewModel() {
    
    fun createTextRecord(
        content: String,
        emotion: EmotionType,
        isPublic: Boolean,
        onResult: (Boolean) -> Unit
    ) {
        viewModelScope.launch {
            try {
                val record = TimeRecord(
                    id = "", // 将由后端生成
                    userId = "", // 将从认证状态获取
                    type = RecordType.TEXT,
                    content = content,
                    emotion = emotion,
                    isPublic = isPublic
                )
                
                val result = timeRecordRepository.createRecord(record)
                onResult(result.isSuccess)
            } catch (e: Exception) {
                onResult(false)
            }
        }
    }
}