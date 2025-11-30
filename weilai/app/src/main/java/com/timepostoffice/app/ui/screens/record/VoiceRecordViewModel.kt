package com.timepostoffice.app.ui.screens.record

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timepostoffice.app.data.model.EmotionType
import com.timepostoffice.app.data.model.RecordType
import com.timepostoffice.app.data.model.TimeRecord
import com.timepostoffice.app.data.repository.TimeRecordRepository
import com.timepostoffice.app.data.repository.AIAnalysisRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class VoiceRecordViewModel @Inject constructor(
    private val timeRecordRepository: TimeRecordRepository,
    private val aiAnalysisRepository: AIAnalysisRepository
) : ViewModel() {
    
    private var currentRecordingFile: File? = null
    
    fun startRecording() {
        // 这里应该实现录音逻辑，创建临时文件
        // 由于这是一个复杂的音频录制功能，需要MediaRecorder实现
        // 这里只是提供框架
        viewModelScope.launch {
            // 创建临时录音文件
            currentRecordingFile = createTempRecordingFile()
            // 开始录音逻辑
        }
    }
    
    fun stopRecording(onResult: (File?) -> Unit) {
        viewModelScope.launch {
            // 停止录音逻辑
            onResult(currentRecordingFile)
        }
    }
    
    fun analyzeAudio(audioFile: File, onResult: (String?) -> Unit) {
        viewModelScope.launch {
            try {
                val analysis = aiAnalysisRepository.analyzeAudio(audioFile)
                onResult(analysis)
            } catch (e: Exception) {
                onResult(null)
            }
        }
    }
    
    fun createVoiceRecord(
        audioFile: File,
        emotion: EmotionType,
        isPublic: Boolean,
        aiAnalysis: String?,
        onResult: (Boolean) -> Unit
    ) {
        viewModelScope.launch {
            try {
                val record = TimeRecord(
                    id = "",
                    userId = "",
                    type = RecordType.VOICE,
                    content = aiAnalysis ?: "语音记录",
                    emotion = emotion,
                    audioUrl = audioFile.absolutePath,
                    isPublic = isPublic
                )
                
                val result = timeRecordRepository.createRecord(record)
                onResult(result.isSuccess)
            } catch (e: Exception) {
                onResult(false)
            }
        }
    }
    
    private fun createTempRecordingFile(): File {
        // 创建临时录音文件
        return File.createTempFile("recording", ".m4a")
    }
}