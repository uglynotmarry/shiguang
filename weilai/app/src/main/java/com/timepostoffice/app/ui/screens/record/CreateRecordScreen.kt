package com.timepostoffice.app.ui.screens.record

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.foundation.text.BasicTextField
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateRecordScreen(
    onNavigateBack: () -> Unit,
    viewModel: CreateRecordViewModel = hiltViewModel()
) {
    var content by remember { mutableStateOf("") }
    var selectedEmotion by remember { mutableStateOf<EmotionType?>(null) }
    var isPublic by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.create_text_record)) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = stringResource(R.string.back)
                        )
                    }
                },
                actions = {
                    TextButton(
                        onClick = {
                            if (content.isNotBlank() && selectedEmotion != null) {
                                isLoading = true
                                viewModel.createTextRecord(
                                    content = content,
                                    emotion = selectedEmotion!!,
                                    isPublic = isPublic
                                ) { success ->
                                    isLoading = false
                                    if (success) {
                                        onNavigateBack()
                                    }
                                }
                            }
                        },
                        enabled = content.isNotBlank() && selectedEmotion != null && !isLoading
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(stringResource(R.string.save))
                        }
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
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 内容输入
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                BasicTextField(
                    value = content,
                    onValueChange = { content = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .padding(16.dp),
                    textStyle = MaterialTheme.typography.bodyLarge.copy(
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                ) { innerTextField ->
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.TopStart
                    ) {
                        if (content.isEmpty()) {
                            Text(
                                text = stringResource(R.string.record_content_hint),
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                            )
                        }
                        innerTextField()
                    }
                }
            }
            
            // 情绪选择
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