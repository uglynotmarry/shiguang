package com.timepostoffice.app.data.model

import java.util.UUID

data class User(
    val id: String,
    val email: String,
    val nickname: String,
    val avatarUrl: String? = null,
    val isPremium: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

sealed class AuthState {
    object Loading : AuthState()
    data class Authenticated(val user: User) : AuthState()
    object Unauthenticated : AuthState()
    data class Error(val message: String) : AuthState()
}