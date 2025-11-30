package com.timepostoffice.app.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import androidx.exifinterface.media.ExifInterface
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.net.URL
import com.timepostoffice.app.utils.ErrorHandler

object ImageLoader {
    
    private const val MAX_IMAGE_SIZE = 1024 // Maximum dimension in pixels
    private const val COMPRESSION_QUALITY = 80
    private const val CACHE_DIR = "image_cache"
    
    suspend fun loadAndOptimizeImage(
        context: Context,
        imageUrl: String,
        maxWidth: Int = MAX_IMAGE_SIZE,
        maxHeight: Int = MAX_IMAGE_SIZE
    ): Bitmap? = withContext(Dispatchers.IO) {
        try {
            // Check cache first
            val cachedBitmap = getCachedImage(context, imageUrl)
            if (cachedBitmap != null) {
                return@withContext cachedBitmap
            }
            
            // Download image
            val url = URL(imageUrl)
            val connection = url.openConnection().apply {
                connectTimeout = 10000 // 10 seconds
                readTimeout = 15000 // 15 seconds
            }
            
            val inputStream = connection.getInputStream()
            val options = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            
            BitmapFactory.decodeStream(inputStream, null, options)
            inputStream.close()
            
            // Calculate sample size
            val sampleSize = calculateInSampleSize(options, maxWidth, maxHeight)
            
            // Download again with sample size
            val newConnection = url.openConnection().apply {
                connectTimeout = 10000
                readTimeout = 15000
            }
            
            val newInputStream = newConnection.getInputStream()
            val finalOptions = BitmapFactory.Options().apply {
                inSampleSize = sampleSize
                inPreferredConfig = Bitmap.Config.RGB_565 // Use less memory
            }
            
            val bitmap = BitmapFactory.decodeStream(newInputStream, null, finalOptions)
            newInputStream.close()
            
            bitmap?.let {
                // Rotate if necessary
                val rotatedBitmap = rotateImageIfRequired(it, imageUrl)
                
                // Cache the optimized bitmap
                cacheImage(context, imageUrl, rotatedBitmap)
                
                rotatedBitmap
            }
        } catch (e: Exception) {
            ErrorHandler.logError("ImageLoader", "Failed to load image: $imageUrl", e)
            null
        }
    }
    
    private fun calculateInSampleSize(
        options: BitmapFactory.Options,
        reqWidth: Int,
        reqHeight: Int
    ): Int {
        val height = options.outHeight
        val width = options.outWidth
        var inSampleSize = 1
        
        if (height > reqHeight || width > reqWidth) {
            val halfHeight = height / 2
            val halfWidth = width / 2
            
            while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
                inSampleSize *= 2
            }
        }
        
        return inSampleSize
    }
    
    private fun rotateImageIfRequired(bitmap: Bitmap, imagePath: String): Bitmap {
        try {
            val exif = ExifInterface(imagePath)
            val orientation = exif.getAttributeInt(
                ExifInterface.TAG_ORIENTATION,
                ExifInterface.ORIENTATION_NORMAL
            )
            
            return when (orientation) {
                ExifInterface.ORIENTATION_ROTATE_90 -> rotateBitmap(bitmap, 90f)
                ExifInterface.ORIENTATION_ROTATE_180 -> rotateBitmap(bitmap, 180f)
                ExifInterface.ORIENTATION_ROTATE_270 -> rotateBitmap(bitmap, 270f)
                else -> bitmap
            }
        } catch (e: Exception) {
            ErrorHandler.logWarning("ImageLoader", "Failed to rotate image: $imagePath", e)
            return bitmap
        }
    }
    
    private fun rotateBitmap(bitmap: Bitmap, degrees: Float): Bitmap {
        val matrix = Matrix().apply { postRotate(degrees) }
        return Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
    }
    
    private fun getCachedImage(context: Context, url: String): Bitmap? {
        return try {
            val cacheDir = File(context.cacheDir, CACHE_DIR)
            val cacheFile = File(cacheDir, url.hashCode().toString())
            
            if (cacheFile.exists()) {
                BitmapFactory.decodeFile(cacheFile.absolutePath)
            } else {
                null
            }
        } catch (e: Exception) {
            ErrorHandler.logWarning("ImageLoader", "Failed to get cached image", e)
            null
        }
    }
    
    private fun cacheImage(context: Context, url: String, bitmap: Bitmap) {
        try {
            val cacheDir = File(context.cacheDir, CACHE_DIR)
            if (!cacheDir.exists()) {
                cacheDir.mkdirs()
            }
            
            val cacheFile = File(cacheDir, url.hashCode().toString())
            FileOutputStream(cacheFile).use { outputStream ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, COMPRESSION_QUALITY, outputStream)
            }
        } catch (e: Exception) {
            ErrorHandler.logWarning("ImageLoader", "Failed to cache image", e)
        }
    }
    
    fun clearCache(context: Context) {
        try {
            val cacheDir = File(context.cacheDir, CACHE_DIR)
            if (cacheDir.exists()) {
                cacheDir.deleteRecursively()
            }
        } catch (e: Exception) {
            ErrorHandler.logWarning("ImageLoader", "Failed to clear cache", e)
        }
    }
}