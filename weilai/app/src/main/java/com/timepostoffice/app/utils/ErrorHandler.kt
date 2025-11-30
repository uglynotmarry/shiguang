package com.timepostoffice.app.utils

import android.util.Log
import kotlinx.coroutines.flow.*
import retrofit2.Response
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ErrorHandler @Inject constructor() {
    
    companion object {
        private const val TAG = "ErrorHandler"
        
        fun logError(tag: String, message: String, throwable: Throwable? = null) {
            Log.e(tag, message, throwable)
        }
        
        fun logWarning(tag: String, message: String, throwable: Throwable? = null) {
            Log.w(tag, message, throwable)
        }
        
        fun logInfo(tag: String, message: String) {
            Log.i(tag, message)
        }
        
        fun logDebug(tag: String, message: String) {
            Log.d(tag, message)
        }
    }
    
    suspend fun <T> handleApiCall(
        call: suspend () -> Response<T>
    ): Result<T> {
        return try {
            val response = call()
            if (response.isSuccessful) {
                response.body()?.let { body ->
                    Result.success(body)
                } ?: Result.failure(Exception("Empty response body"))
            } else {
                val errorMessage = "API Error: ${response.code()} - ${response.message()}"
                Log.e(TAG, errorMessage)
                Result.failure(Exception(errorMessage))
            }
        } catch (e: IOException) {
            Log.e(TAG, "Network error", e)
            Result.failure(Exception("网络连接失败，请检查网络设置"))
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error", e)
            Result.failure(Exception("发生未知错误，请稍后重试"))
        }
    }
    
    fun getErrorMessage(exception: Throwable?): String {
        return when (exception) {
            is IOException -> "网络连接失败，请检查网络设置"
            is java.net.UnknownHostException -> "无法连接到服务器"
            is java.net.SocketTimeoutException -> "连接超时，请稍后重试"
            is java.net.ConnectException -> "服务器连接失败"
            else -> exception?.message ?: "发生未知错误"
        }
    }
    
    // Instance methods (can be called on injected instances)
    fun logErrorInstance(tag: String, message: String, throwable: Throwable? = null) {
        Log.e(tag, message, throwable)
    }
    
    fun logWarningInstance(tag: String, message: String, throwable: Throwable? = null) {
        Log.w(tag, message, throwable)
    }
    
    fun logInfoInstance(tag: String, message: String) {
        Log.i(tag, message)
    }
    
    fun logDebugInstance(tag: String, message: String) {
        Log.d(tag, message)
    }
}