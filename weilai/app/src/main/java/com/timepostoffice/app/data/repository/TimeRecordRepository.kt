package com.timepostoffice.app.data.repository

import com.timepostoffice.app.data.model.TimeRecord
import com.timepostoffice.app.data.model.EmotionType
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.storage.storage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.util.Date
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TimeRecordRepository @Inject constructor(
    private val supabaseClient: SupabaseClient
) {
    
    private val postgrest = supabaseClient.postgrest
    private val storage = supabaseClient.storage
    
    suspend fun createRecord(record: TimeRecord): Result<TimeRecord> = withContext(Dispatchers.IO) {
        try {
            val result = postgrest.from("time_records")
                .insert(record)
                .decodeSingle<TimeRecord>()
            
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getMyRecords(): List<TimeRecord> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("time_records")
                .select {
                    order("created_at", Order.DESCENDING)
                }
                .decodeList<TimeRecord>()
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    suspend fun getPublicRecords(emotionFilter: EmotionType? = null): List<TimeRecord> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("time_records")
                .select {
                    filter {
                        eq("is_public", true)
                        emotionFilter?.let {
                            eq("emotion", it.name)
                        }
                    }
                    order("created_at", Order.DESCENDING)
                    limit(50)
                }
                .decodeList<TimeRecord>()
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    suspend fun getRecordById(recordId: String): TimeRecord? = withContext(Dispatchers.IO) {
        try {
            postgrest.from("time_records")
                .select {
                    filter {
                        eq("id", recordId)
                    }
                    limit(1)
                    single()
                }
                .decodeSingleOrNull<TimeRecord>()
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun updateRecord(record: TimeRecord): Result<TimeRecord> = withContext(Dispatchers.IO) {
        try {
            val result = postgrest.from("time_records")
                .update(record) {
                    filter {
                        eq("id", record.id)
                    }
                }
                .decodeSingle<TimeRecord>()
            
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteRecord(recordId: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("time_records")
                .delete {
                    filter {
                        eq("id", recordId)
                    }
                }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun uploadAudioFile(file: File, fileName: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val bytes = file.readBytes()
            val path = "audio/$fileName"
            
            storage.from("time_records").upload(path, bytes)
            
            val publicUrl = storage.from("time_records").publicUrl(path)
            Result.success(publicUrl)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteAudioFile(fileUrl: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val path = fileUrl.substringAfterLast("/")
            storage.from("time_records").delete(path)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}