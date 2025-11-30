package com.timepostoffice.app.ui.screens.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timepostoffice.app.data.model.User
import com.timepostoffice.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    val currentUser: StateFlow<User?> = authRepository.authState
        .map { state ->
            when (state) {
                is com.timepostoffice.app.data.model.AuthState.Authenticated -> state.user
                else -> null
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )
    
    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
        }
    }
}