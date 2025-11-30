package com.timepostoffice.app.utils

import android.app.ActivityManager
import android.content.Context
import android.graphics.Bitmap
import android.annotation.TargetApi
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import com.timepostoffice.app.utils.ErrorHandler
import java.lang.ref.WeakReference
import java.util.concurrent.ConcurrentHashMap

object MemoryManager {
    
    private const val MAX_MEMORY_USAGE_PERCENTAGE = 0.8 // 80% of available memory
    private val activeBitmaps = ConcurrentHashMap<String, WeakReference<Bitmap>>()
    
    fun getAvailableMemory(context: Context): Long {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memoryInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memoryInfo)
        return memoryInfo.availMem
    }
    
    fun getTotalMemory(context: Context): Long {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memoryInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memoryInfo)
        return memoryInfo.totalMem
    }
    
    fun isLowMemory(context: Context): Boolean {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memoryInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memoryInfo)
        return memoryInfo.lowMemory
    }
    
    fun canAllocateMemory(context: Context, requiredBytes: Long): Boolean {
        val availableMemory = getAvailableMemory(context)
        val totalMemory = getTotalMemory(context)
        val usagePercentage = (totalMemory - availableMemory).toDouble() / totalMemory
        
        return usagePercentage < MAX_MEMORY_USAGE_PERCENTAGE && availableMemory > requiredBytes
    }
    
    @TargetApi(26)
    fun calculateBitmapMemoryUsage(width: Int, height: Int, config: Bitmap.Config = Bitmap.Config.ARGB_8888): Long {
        return when (config) {
            Bitmap.Config.ALPHA_8 -> (width * height).toLong()
            Bitmap.Config.RGB_565 -> (width * height * 2).toLong()
            @Suppress("DEPRECATION") Bitmap.Config.ARGB_4444 -> (width * height * 2).toLong()
            Bitmap.Config.ARGB_8888 -> (width * height * 4).toLong()
            Bitmap.Config.RGBA_F16 -> (width * height * 8).toLong()
            else -> (width * height * 4).toLong()
        }
    }
    
    fun registerBitmap(key: String, bitmap: Bitmap) {
        activeBitmaps[key] = WeakReference(bitmap)
    }
    
    fun unregisterBitmap(key: String) {
        activeBitmaps.remove(key)
    }
    
    fun getRegisteredBitmap(key: String): Bitmap? {
        return activeBitmaps[key]?.get()
    }
    
    fun clearInactiveBitmaps() {
        activeBitmaps.entries.removeIf { it.value.get() == null }
    }
    
    fun forceGarbageCollection() {
        System.gc()
        System.runFinalization()
        System.gc()
    }
    
    fun getMemoryUsageStats(context: Context): MemoryStats {
        val runtime = Runtime.getRuntime()
        val totalMemory = runtime.totalMemory()
        val freeMemory = runtime.freeMemory()
        val usedMemory = totalMemory - freeMemory
        val maxMemory = runtime.maxMemory()
        
        val systemAvailableMemory = getAvailableMemory(context)
        val systemTotalMemory = getTotalMemory(context)
        
        return MemoryStats(
            usedMemory = usedMemory,
            freeMemory = freeMemory,
            totalMemory = totalMemory,
            maxMemory = maxMemory,
            systemAvailableMemory = systemAvailableMemory,
            systemTotalMemory = systemTotalMemory,
            activeBitmapsCount = activeBitmaps.size
        )
    }
    
    fun performMemoryCleanup(context: Context) {
        ErrorHandler.logInfo("MemoryManager", "Performing memory cleanup")
        
        // Clear inactive bitmaps
        clearInactiveBitmaps()
        
        // Clear image cache
        ImageLoader.clearCache(context)
        
        // Clear app cache
        try {
            context.cacheDir.deleteRecursively()
        } catch (e: Exception) {
            ErrorHandler.logWarning("MemoryManager", "Failed to clear app cache", e)
        }
        
        // Force garbage collection
        forceGarbageCollection()
        
        ErrorHandler.logInfo("MemoryManager", "Memory cleanup completed")
    }
}

data class MemoryStats(
    val usedMemory: Long,
    val freeMemory: Long,
    val totalMemory: Long,
    val maxMemory: Long,
    val systemAvailableMemory: Long,
    val systemTotalMemory: Long,
    val activeBitmapsCount: Int
) {
    val usedMemoryMB: Double get() = usedMemory / (1024.0 * 1024.0)
    val freeMemoryMB: Double get() = freeMemory / (1024.0 * 1024.0)
    val totalMemoryMB: Double get() = totalMemory / (1024.0 * 1024.0)
    val systemAvailableMemoryMB: Double get() = systemAvailableMemory / (1024.0 * 1024.0)
    val systemTotalMemoryMB: Double get() = systemTotalMemory / (1024.0 * 1024.0)
    val memoryUsagePercentage: Double get() = (usedMemory.toDouble() / totalMemory) * 100
}

/**
 * Composable function to monitor memory usage and automatically cleanup when needed
 */
@Composable
fun MemoryMonitor(
    onLowMemory: () -> Unit = {},
    cleanupInterval: Long = 30000L // 30 seconds
) {
    val context = LocalContext.current
    val memoryManager = remember { MemoryManager }
    
    DisposableEffect(Unit) {
        val cleanupRunnable = Runnable {
            if (memoryManager.isLowMemory(context)) {
                ErrorHandler.logWarning("MemoryMonitor", "Low memory detected, performing cleanup")
                memoryManager.performMemoryCleanup(context)
                onLowMemory()
            }
        }
        
        val handler = android.os.Handler(android.os.Looper.getMainLooper())
        handler.postDelayed(cleanupRunnable, cleanupInterval)
        
        onDispose {
            handler.removeCallbacks(cleanupRunnable)
        }
    }
}