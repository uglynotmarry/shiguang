package com.timepostoffice.app.data.repository

import com.timepostoffice.app.data.model.User
import com.timepostoffice.app.data.model.AuthState
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.gotrue.user.UserInfo
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val supabaseClient: SupabaseClient
) {
    
    private val _authState = MutableStateFlow<AuthState>(AuthState.Unauthenticated)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()
    
    suspend fun login(email: String, password: String): Result<User> {
        return try {
            _authState.value = AuthState.Loading
            
            supabaseClient.auth.signInWith(Email) {
                this.email = email.trim() // 去除空格
                this.password = password
            }
            
            val userInfo = supabaseClient.auth.retrieveUserForCurrentSession(updateSession = true)
            val user = userInfo.toUser()
            
            _authState.value = AuthState.Authenticated(user)
            Result.success(user)
        } catch (e: Exception) {
            _authState.value = AuthState.Error(e.message ?: "Login failed")
            Result.failure(e)
        }
    }
    
    suspend fun register(email: String, password: String, nickname: String): Result<User> {
        return try {
            _authState.value = AuthState.Loading
            println("Starting registration for email: $email")
            
            // 注册用户 - Supabase注册可能不会立即创建会话
            println("Calling Supabase auth.signUpWith...")
            supabaseClient.auth.signUpWith(Email) {
                this.email = email
                this.password = password
            }
            println("Supabase registration completed")
            
            // 获取当前用户信息 - 注册后可能不会立即有会话
            val currentUser = supabaseClient.auth.currentUserOrNull()
            println("Current user after registration: $currentUser")
            
            if (currentUser == null) {
                // 这在邮箱验证启用时是正常的，或者用户已存在
                println("No current user after registration - email verification may be required")
                
                // 创建一个临时用户对象用于界面显示
                val tempUser = User(
                    id = "pending",
                    email = email,
                    nickname = nickname
                )
                _authState.value = AuthState.Authenticated(tempUser)
                return Result.success(tempUser)
            }
            
            val userId = currentUser.id
            println("User ID from registration: $userId")
            
            val newUser = User(
                id = userId,
                email = email,
                nickname = nickname
            )
            
            // 创建用户资料 - 只在用户存在时创建
            try {
                println("Creating user profile in database...")
                supabaseClient.from("users").insert(newUser)
                println("User profile created successfully")
            } catch (e: Exception) {
                println("User profile creation failed: ${e.message}")
                println("Continuing with registration despite profile creation failure")
            }
            
            _authState.value = AuthState.Authenticated(newUser)
            println("Registration successful for user: $userId")
            Result.success(newUser)
        } catch (e: Exception) {
            println("Registration failed with exception: ${e.message}")
            e.printStackTrace()
            // 提供更具体的错误信息
            val errorMessage = when {
                e.message?.contains("User already registered") == true -> "该邮箱已被注册"
                e.message?.contains("Invalid email") == true -> "邮箱格式不正确：${email}"
                e.message?.contains("Unable to validate email address") == true -> "邮箱验证失败：${email}。请检查邮箱格式是否正确"
                e.message?.contains("Password should be at least") == true -> "密码长度不够"
                else -> "注册失败：${e.message ?: "请检查网络连接"}"
            }
            
            _authState.value = AuthState.Error(errorMessage)
            Result.failure(e)
        }
    }
    
    suspend fun logout() {
        try {
            supabaseClient.auth.signOut()
            _authState.value = AuthState.Unauthenticated
        } catch (e: Exception) {
            _authState.value = AuthState.Error(e.message ?: "Logout failed")
        }
    }
    
    fun getCurrentUser(): User? {
        return (authState.value as? AuthState.Authenticated)?.user
    }
    
    suspend fun checkAuthStatus() {
        try {
            val userInfo = supabaseClient.auth.retrieveUserForCurrentSession()
            val user = userInfo.toUser()
            _authState.value = AuthState.Authenticated(user)
        } catch (e: Exception) {
            _authState.value = AuthState.Unauthenticated
        }
    }
    
    private fun UserInfo.toUser(): User {
        return User(
            id = this.id,
            email = this.email ?: "",
            nickname = this.userMetadata?.get("nickname")?.toString() ?: "用户",
            avatarUrl = this.userMetadata?.get("avatar_url")?.toString(),
            isPremium = this.userMetadata?.get("is_premium")?.toString()?.toBoolean() ?: false,
            createdAt = this.createdAt?.toEpochMilliseconds() ?: System.currentTimeMillis(),
            updatedAt = this.updatedAt?.toEpochMilliseconds() ?: System.currentTimeMillis()
        )
    }
}