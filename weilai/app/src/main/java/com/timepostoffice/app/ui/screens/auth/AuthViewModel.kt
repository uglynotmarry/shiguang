package com.timepostoffice.app.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timepostoffice.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    val authState = authRepository.authState
    
    fun login(email: String, password: String, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            val result = authRepository.login(email, password)
            onResult(result.isSuccess)
        }
    }
    
    fun register(email: String, password: String, nickname: String, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            val result = authRepository.register(email, password, nickname)
            onResult(result.isSuccess)
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
        }
    }
}