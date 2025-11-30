package com.timepostoffice.app.data.model

enum class RecordType {
    TEXT, VOICE
}

enum class EmotionType {
    HAPPY, TOUCHED, MISSING, SENTIMENTAL, GRATEFUL, HOPEFUL
}

data class TimeRecord(
    val id: String,
    val userId: String,
    val type: RecordType,
    val content: String,
    val emotion: EmotionType,
    val audioUrl: String? = null,
    val isPublic: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

data class AIAnalysis(
    val keywords: List<String> = emptyList(),
    val emotionScore: Float = 0.5f,
    val sentiment: String = "neutral",
    val summary: String = "",
    val emotionType: EmotionType? = null
)