@file:OptIn(ExperimentalMaterial3Api::class)
package com.timepostoffice.app.ui.screens.timeline

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.timepostoffice.app.data.model.TimeRecord
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PublicTimelineScreen(
    onNavigateBack: () -> Unit,
    onNavigateToRecordDetail: (String) -> Unit,
    viewModel: PublicTimelineViewModel = hiltViewModel()
) {
    val publicRecords by viewModel.publicRecords.collectAsState()
    var isLoading by remember { mutableStateOf(false) }
    var selectedEmotion by remember { mutableStateOf<com.timepostoffice.app.data.model.EmotionType?>(null) }
    
    LaunchedEffect(selectedEmotion) {
        isLoading = true
        viewModel.loadPublicRecords(selectedEmotion)
        isLoading = false
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.public_timeline)) },
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
        ) {
            // 情绪筛选
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = stringResource(R.string.filter_by_emotion),
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        FilterChip(
                            selected = selectedEmotion == null,
                            onClick = { selectedEmotion = null },
                            label = { Text(stringResource(R.string.all)) }
                        )
                        
                        com.timepostoffice.app.data.model.EmotionType.values().forEach { emotion ->
                            FilterChip(
                                selected = selectedEmotion == emotion,
                                onClick = { selectedEmotion = emotion },
                                label = { Text(getEmotionDisplayName(emotion)) }
                            )
                        }
                    }
                }
            }
            
            // 公开记录列表
            if (isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else if (publicRecords.isEmpty()) {
                EmptyPublicRecordsState()
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    items(publicRecords) { record ->
                        PublicRecordCard(
                            record = record,
                            onClick = { onNavigateToRecordDetail(record.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyPublicRecordsState() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Public,
                contentDescription = null,
                modifier = Modifier.size(80.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            Text(
                text = stringResource(R.string.no_public_records),
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = stringResource(R.string.be_first_to_share),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun PublicRecordCard(
    record: TimeRecord,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // 用户信息
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = null,
                    modifier = Modifier.size(32.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Column {
                    Text(
                        text = "匿名用户",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = formatDate(record.createdAt),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            // 情绪标签
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Favorite,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = getEmotionDisplayName(record.emotion),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            // 内容
            Text(
                text = if (record.content.length > 100) {
                    record.content.take(100) + "..."
                } else {
                    record.content
                },
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            // 记录类型图标
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                Icon(
                    imageVector = if (record.type == com.timepostoffice.app.data.model.RecordType.TEXT) {
                        Icons.Default.Note
                    } else {
                        Icons.Default.Mic
                    },
                    contentDescription = null,
                    modifier = Modifier.size(20.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

private fun formatDate(timestamp: Long): String {
    val sdf = SimpleDateFormat("MM月dd日 HH:mm", Locale.getDefault())
    return sdf.format(Date(timestamp))
}

private fun getEmotionDisplayName(emotion: com.timepostoffice.app.data.model.EmotionType): String {
    return when (emotion) {
        com.timepostoffice.app.data.model.EmotionType.HAPPY -> "快乐"
        com.timepostoffice.app.data.model.EmotionType.TOUCHED -> "感动"
        com.timepostoffice.app.data.model.EmotionType.MISSING -> "思念"
        com.timepostoffice.app.data.model.EmotionType.SENTIMENTAL -> "感伤"
        com.timepostoffice.app.data.model.EmotionType.GRATEFUL -> "感激"
        com.timepostoffice.app.data.model.EmotionType.HOPEFUL -> "希望"
    }
}