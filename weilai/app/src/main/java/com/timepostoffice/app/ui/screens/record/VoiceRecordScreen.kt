package com.timepostoffice.app.ui.screens.record

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.timepostoffice.app.R
import com.timepostoffice.app.data.model.EmotionType
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceRecordScreen(
    onNavigateBack: () -> Unit,
    viewModel: VoiceRecordViewModel = hiltViewModel()
) {
    var selectedEmotion by remember { mutableStateOf<EmotionType?>(null) }
    var isPublic by remember { mutableStateOf(false) }
    var isRecording by remember { mutableStateOf(false) }
    var isAnalyzing by remember { mutableStateOf(false) }
    var recordedFile by remember { mutableStateOf<File?>(null) }
    var aiAnalysis by remember { mutableStateOf<String?>(null) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.create_voice_record)) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = stringResource(R.string.back)
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // 录音界面
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        if (isRecording) {
                            Icon(
                                imageVector = Icons.Default.Mic,
                                contentDescription = null,
                                modifier = Modifier.size(80.dp),
                                tint = MaterialTheme.colorScheme.error
                            )
                            Text(
                                text = stringResource(R.string.recording),
                                style = MaterialTheme.typography.headlineSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        } else if (recordedFile != null) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                modifier = Modifier.size(80.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = stringResource(R.string.recorded),
                                style = MaterialTheme.typography.headlineSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            if (aiAnalysis != null) {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.cardColors(
                                        containerColor = MaterialTheme.colorScheme.secondaryContainer
                                    )
                                ) {
                                    Text(
                                        text = aiAnalysis!!,
                                        modifier = Modifier.padding(16.dp),
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSecondaryContainer
                                    )
                                }
                            }
                        } else {
                            Icon(
                                imageVector = Icons.Default.Mic,
                                contentDescription = null,
                                modifier = Modifier.size(80.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = stringResource(R.string.tap_to_record),
                                style = MaterialTheme.typography.headlineSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }
            
            // 录音控制按钮
            if (recordedFile != null) {
                FloatingActionButton(
                    onClick = {
                        if (isRecording) {
                            viewModel.stopRecording { file ->
                                isRecording = false
                                recordedFile = file
                                if (file != null) {
                                    isAnalyzing = true
                                    viewModel.analyzeAudio(file) { analysis ->
                                        aiAnalysis = analysis
                                        isAnalyzing = false
                                    }
                                }
                            }
                        } else {
                            viewModel.startRecording()
                            isRecording = true
                        }
                    },
                    containerColor = if (isRecording) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                ) {
                    Icon(
                        imageVector = if (isRecording) Icons.Default.Stop else Icons.Default.Mic,
                        contentDescription = stringResource(if (isRecording) R.string.stop else R.string.record)
                    )
                }
            }
            
            // 情绪选择
            if (recordedFile != null) {
                Text(
                    text = stringResource(R.string.emotion_select),
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    EmotionType.values().forEach { emotion ->
                        FilterChip(
                            selected = selectedEmotion == emotion,
                            onClick = { selectedEmotion = emotion },
                            label = { Text(getEmotionDisplayName(emotion)) }
                        )
                    }
                }
                
                // 公开分享选项
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = isPublic,
                        onCheckedChange = { isPublic = it }
                    )
                    Text(
                        text = stringResource(R.string.make_public),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
                
                // 保存按钮
                Button(
                    onClick = {
                        if (selectedEmotion != null && recordedFile != null) {
                            isAnalyzing = true
                            viewModel.createVoiceRecord(
                                audioFile = recordedFile!!,
                                emotion = selectedEmotion!!,
                                isPublic = isPublic,
                                aiAnalysis = aiAnalysis
                            ) { success ->
                                isAnalyzing = false
                                if (success) {
                                    onNavigateBack()
                                }
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = selectedEmotion != null && !isAnalyzing
                ) {
                    if (isAnalyzing) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(stringResource(R.string.save))
                    }
                }
            }
        }
    }
}

private fun getEmotionDisplayName(emotion: EmotionType): String {
    return when (emotion) {
        EmotionType.HAPPY -> "快乐"
        EmotionType.TOUCHED -> "感动"
        EmotionType.MISSING -> "思念"
        EmotionType.SENTIMENTAL -> "感伤"
        EmotionType.GRATEFUL -> "感激"
        EmotionType.HOPEFUL -> "希望"
    }
}