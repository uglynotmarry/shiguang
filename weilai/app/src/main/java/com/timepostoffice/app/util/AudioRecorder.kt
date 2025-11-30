package com.timepostoffice.app.util

import android.media.MediaRecorder
import android.os.Build
import java.io.File
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AudioRecorder @Inject constructor() {
    
    private var mediaRecorder: MediaRecorder? = null
    private var isRecording = false
    private var outputFile: File? = null
    
    fun startRecording(outputFilePath: File): Boolean {
        return try {
            outputFile = outputFilePath
            
            mediaRecorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                @Suppress("DEPRECATION") MediaRecorder()
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }.apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setOutputFile(outputFilePath.absolutePath)
                
                prepare()
                start()
            }
            
            isRecording = true
            true
        } catch (e: IOException) {
            e.printStackTrace()
            false
        } catch (e: IllegalStateException) {
            e.printStackTrace()
            false
        }
    }
    
    fun stopRecording(): File? {
        return try {
            mediaRecorder?.apply {
                stop()
                release()
            }
            mediaRecorder = null
            isRecording = false
            outputFile
        } catch (e: RuntimeException) {
            e.printStackTrace()
            null
        } finally {
            mediaRecorder = null
            isRecording = false
        }
    }
    
    fun isRecording(): Boolean = isRecording
    
    fun cancelRecording() {
        try {
            mediaRecorder?.apply {
                stop()
                release()
            }
            mediaRecorder = null
            isRecording = false
            
            // 删除临时文件
            outputFile?.delete()
            outputFile = null
        } catch (e: RuntimeException) {
            e.printStackTrace()
        } finally {
            mediaRecorder = null
            isRecording = false
        }
    }
}