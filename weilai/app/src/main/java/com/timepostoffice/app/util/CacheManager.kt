package com.timepostoffice.app.util

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CacheManager @Inject constructor() {
    
    private val memoryCache = ConcurrentHashMap<String, CacheEntry>()
    private val scope = CoroutineScope(Dispatchers.IO)
    
    companion object {
        private const val DEFAULT_CACHE_SIZE = 50
        private const val DEFAULT_EXPIRY_TIME = 5 * 60 * 1000L // 5 minutes
    }
    
    data class CacheEntry(
        val data: Any,
        val timestamp: Long = System.currentTimeMillis(),
        val expiryTime: Long = DEFAULT_EXPIRY_TIME
    )
    
    fun <T> get(key: String): T? {
        val entry = memoryCache[key]
        return if (entry != null && !isExpired(entry)) {
            @Suppress("UNCHECKED_CAST")
            entry.data as? T
        } else {
            memoryCache.remove(key)
            null
        }
    }
    
    fun put(key: String, data: Any, expiryTime: Long = DEFAULT_EXPIRY_TIME) {
        memoryCache[key] = CacheEntry(data, System.currentTimeMillis(), expiryTime)
        
        // 如果缓存大小超过限制，清理最旧的条目
        if (memoryCache.size > DEFAULT_CACHE_SIZE) {
            cleanupOldestEntries()
        }
    }
    
    fun remove(key: String) {
        memoryCache.remove(key)
    }
    
    fun clear() {
        memoryCache.clear()
    }
    
    fun clearExpired() {
        val expiredKeys = memoryCache.filter { (_, entry) ->
            isExpired(entry)
        }.keys
        
        expiredKeys.forEach { key ->
            memoryCache.remove(key)
        }
    }
    
    private fun isExpired(entry: CacheEntry): Boolean {
        return System.currentTimeMillis() - entry.timestamp > entry.expiryTime
    }
    
    private fun cleanupOldestEntries() {
        val sortedEntries = memoryCache.entries.sortedBy { it.value.timestamp }
        val entriesToRemove = sortedEntries.take(memoryCache.size - DEFAULT_CACHE_SIZE)
        
        entriesToRemove.forEach { (key, _) ->
            memoryCache.remove(key)
        }
    }
    
    // 定期清理过期条目
    init {
        scope.launch {
            flow {
                while (true) {
                    emit(Unit)
                    kotlinx.coroutines.delay(60_000) // 每分钟检查一次
                }
            }.collect {
                clearExpired()
            }
        }
    }
}