package com.timepostoffice.app.utils

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class CacheManagerTest {
    
    private lateinit var cacheManager: CacheManager
    private val testDispatcher = StandardTestDispatcher()
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        cacheManager = CacheManager()
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
        cacheManager.clear()
    }
    
    @Test
    fun `put and get should work correctly`() {
        // Given
        val key = "test-key"
        val value = "test-value"
        
        // When
        cacheManager.put(key, value)
        val result = cacheManager.get<String>(key)
        
        // Then
        assertEquals(value, result)
    }
    
    @Test
    fun `get should return null for non-existent key`() {
        // Given
        val key = "non-existent-key"
        
        // When
        val result = cacheManager.get<String>(key)
        
        // Then
        assertNull(result)
    }
    
    @Test
    fun `remove should delete cached item`() {
        // Given
        val key = "test-key"
        val value = "test-value"
        cacheManager.put(key, value)
        
        // When
        cacheManager.remove(key)
        val result = cacheManager.get<String>(key)
        
        // Then
        assertNull(result)
    }
    
    @Test
    fun `clear should remove all cached items`() {
        // Given
        cacheManager.put("key1", "value1")
        cacheManager.put("key2", "value2")
        
        // When
        cacheManager.clear()
        val result1 = cacheManager.get<String>("key1")
        val result2 = cacheManager.get<String>("key2")
        
        // Then
        assertNull(result1)
        assertNull(result2)
    }
    
    @Test
    fun `cache should respect size limit`() {
        // Given
        val cacheWithSmallLimit = CacheManager(maxSize = 2)
        
        // When
        cacheWithSmallLimit.put("key1", "value1")
        cacheWithSmallLimit.put("key2", "value2")
        cacheWithSmallLimit.put("key3", "value3") // Should evict oldest
        
        val result1 = cacheWithSmallLimit.get<String>("key1")
        val result2 = cacheWithSmallLimit.get<String>("key2")
        val result3 = cacheWithSmallLimit.get<String>("key3")
        
        // Then
        assertNull(result1) // Evicted
        assertEquals("value2", result2)
        assertEquals("value3", result3)
    }

    @Test
    fun testClear() {
        // Given
        cache.put("key1", "value1")
        cache.put("key2", "value2")
        
        // When
        cache.clear()
        
        // Then
        assertNull(cache.get<String>("key1"))
        assertNull(cache.get<String>("key2"))
    }

    @Test
    fun testSize() {
        // Given
        cache.put("key1", "value1")
        cache.put("key2", "value2")
        
        // When/Then
        assertEquals(2, cache.size())
        
        cache.put("key3", "value3")
        assertEquals(3, cache.size())
    }
}