package com.timepostoffice.app.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.timepostoffice.app.utils.ErrorHandler
import com.timepostoffice.app.utils.ImageLoader
import com.timepostoffice.app.utils.MemoryManager
import com.timepostoffice.app.utils.MemoryMonitor
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay

@Composable
fun OptimizedImage(
    imageUrl: String,
    contentDescription: String? = null,
    modifier: Modifier = Modifier,
    placeholderResId: Int? = null,
    errorResId: Int? = null,
    maxWidth: Int = 1024,
    maxHeight: Int = 1024,
    contentScale: ContentScale = ContentScale.Fit
) {
    val context = LocalContext.current
    var bitmap by remember { mutableStateOf<android.graphics.Bitmap?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val imageKey = remember { "optimized_image_${imageUrl.hashCode()}" }
    
    DisposableEffect(imageUrl) {
        scope.launch {
            try {
                isLoading = true
                error = null
                
                // Check memory before loading
                val estimatedMemoryUsage = MemoryManager.calculateBitmapMemoryUsage(maxWidth, maxHeight)
                if (!MemoryManager.canAllocateMemory(context, estimatedMemoryUsage)) {
                    ErrorHandler.logWarning("OptimizedImage", "Not enough memory to load image: $imageUrl")
                    error = "内存不足，无法加载图片"
                    isLoading = false
                    return@launch
                }
                
                // Load and optimize image
                val loadedBitmap = ImageLoader.loadAndOptimizeImage(
                    context = context,
                    imageUrl = imageUrl,
                    maxWidth = maxWidth,
                    maxHeight = maxHeight
                )
                
                if (loadedBitmap != null) {
                    bitmap = loadedBitmap
                    MemoryManager.registerBitmap(imageKey, loadedBitmap)
                } else {
                    error = "图片加载失败"
                }
            } catch (e: Exception) {
                ErrorHandler.logError("OptimizedImage", "Error loading image: $imageUrl", e)
                error = "图片加载失败: ${e.message}"
            } finally {
                isLoading = false
            }
        }
        
        onDispose {
            bitmap?.let {
                if (!it.isRecycled) {
                    it.recycle()
                }
            }
            bitmap = null
            MemoryManager.unregisterBitmap(imageKey)
        }
    }
    
    Box(
        modifier = modifier,
        contentAlignment = Alignment.Center
    ) {
        when {
            isLoading -> {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center),
                    color = MaterialTheme.colorScheme.primary
                )
            }
            error != null -> {
                if (errorResId != null) {
                    Image(
                        painter = painterResource(id = errorResId),
                        contentDescription = "Error loading image",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = contentScale
                    )
                } else {
                    Text(
                        text = error ?: "加载失败",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
            bitmap != null -> {
                Image(
                    bitmap = bitmap!!.asImageBitmap(),
                    contentDescription = contentDescription,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = contentScale
                )
            }
            placeholderResId != null -> {
                Image(
                    painter = painterResource(id = placeholderResId),
                    contentDescription = "Placeholder image",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = contentScale
                )
            }
        }
    }
}

@Composable
@Suppress("UNUSED_PARAMETER")
fun OptimizedImageGrid(
    imageUrls: List<String>,
    maxImagesInMemory: Int = 10,
    maxWidth: Int = 512,
    maxHeight: Int = 512
) {
    // Only keep recent images in memory
    val visibleImages = remember(imageUrls) {
        imageUrls.take(maxImagesInMemory)
    }
    
    // Clear old images from memory
    DisposableEffect(visibleImages) {
        onDispose {
            // Cleanup old bitmaps
            for (url in imageUrls) {
                if (!visibleImages.contains(url)) {
                    MemoryManager.unregisterBitmap("optimized_image_${url.hashCode()}")
                }
            }
        }
    }
    
    // Render the grid
    // This is a placeholder - implement your specific grid layout
    // For example, using LazyVerticalGrid or similar
}

@Composable
fun OptimizedImageWithFallback(
    imageUrl: String,
    fallbackImageUrl: String,
    contentDescription: String? = null,
    modifier: Modifier = Modifier,
    placeholderResId: Int? = null,
    errorResId: Int? = null,
    maxWidth: Int = 1024,
    maxHeight: Int = 1024,
    contentScale: ContentScale = ContentScale.Fit,
    maxRetries: Int = 2
) {
    var currentImageUrl by remember { mutableStateOf(imageUrl) }
    var retryCount by remember { mutableStateOf(0) }
    var fallbackUsed by remember { mutableStateOf(false) }
    
    OptimizedImage(
        imageUrl = currentImageUrl,
        contentDescription = contentDescription,
        modifier = modifier,
        placeholderResId = placeholderResId,
        errorResId = errorResId,
        maxWidth = maxWidth,
        maxHeight = maxHeight,
        contentScale = contentScale
    )
    
    // Handle retry logic
    if (retryCount < maxRetries && !fallbackUsed) {
        LaunchedEffect(currentImageUrl) {
            // Wait a bit before retrying
            kotlinx.coroutines.delay(1000L * (retryCount + 1))
            retryCount++
            currentImageUrl = "$imageUrl?retry=$retryCount"
        }
    } else if (retryCount >= maxRetries && !fallbackUsed) {
        // Use fallback image
        fallbackUsed = true
        currentImageUrl = fallbackImageUrl
        retryCount = 0
    }
}

/**
 * Memory-efficient image grid component
 */
@Composable
@Suppress("UNUSED_PARAMETER")
fun OptimizedImageGrid(
    imageUrls: List<String>,
    modifier: Modifier = Modifier,
    maxImagesInMemory: Int = 10,
    itemContent: @Composable (String, Int) -> Unit
) {
    val context = LocalContext.current
    
    // Monitor memory usage
    MemoryMonitor(
        onLowMemory = {
            ErrorHandler.logWarning("OptimizedImageGrid", "Low memory detected, clearing caches")
            MemoryManager.performMemoryCleanup(context)
        }
    )
    
    // Only keep recent images in memory
    val visibleImages = remember(imageUrls) {
        imageUrls.take(maxImagesInMemory)
    }
    
    // Clear old images from memory
    DisposableEffect(visibleImages) {
        onDispose {
            // Cleanup old bitmaps
            for (url in imageUrls) {
                if (!visibleImages.contains(url)) {
                    MemoryManager.unregisterBitmap("optimized_image_${url.hashCode()}")
                }
            }
        }
    }
    
    // Render the grid
    // This is a placeholder - implement your specific grid layout
    // For example, using LazyVerticalGrid or similar
}

/**
 * Preload images for better performance
 */
@Composable
fun ImagePreloader(
    imageUrls: List<String>,
    maxWidth: Int = 512,
    maxHeight: Int = 512
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    
    LaunchedEffect(imageUrls) {
        scope.launch {
            // Preload first few images
            imageUrls.take(3).forEach { url ->
                launch {
                    ImageLoader.loadAndOptimizeImage(
                        context = context,
                        imageUrl = url,
                        maxWidth = maxWidth,
                        maxHeight = maxHeight
                    )
                }
            }
        }
    }
}