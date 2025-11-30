package com.timepostoffice.app.ui.screens.subscription

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timepostoffice.app.data.model.SubscriptionPlan
import com.timepostoffice.app.data.model.User
import com.timepostoffice.app.data.repository.AuthRepository
import com.timepostoffice.app.data.repository.SubscriptionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SubscriptionViewModel @Inject constructor(
    private val subscriptionRepository: SubscriptionRepository,
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _subscriptionPlans = MutableStateFlow<List<SubscriptionPlan>>(emptyList())
    val subscriptionPlans: StateFlow<List<SubscriptionPlan>> = _subscriptionPlans.asStateFlow()
    
    val currentUser: StateFlow<User?> = authRepository.authState
        .map { state ->
            when (state) {
                is com.timepostoffice.app.data.model.AuthState.Authenticated -> state.user
                else -> null
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = kotlinx.coroutines.flow.SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )
    
    init {
        loadSubscriptionPlans()
    }
    
    private fun loadSubscriptionPlans() {
        viewModelScope.launch {
            val plans = subscriptionRepository.getSubscriptionPlans()
            _subscriptionPlans.value = plans
        }
    }
    
    fun purchaseSubscription(planId: String) {
        viewModelScope.launch {
            // 这里实现购买逻辑
            subscriptionRepository.purchaseSubscription(planId, currentUser.value?.id ?: return@launch)
        }
    }
}