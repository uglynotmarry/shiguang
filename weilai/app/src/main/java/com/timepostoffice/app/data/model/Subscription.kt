package com.timepostoffice.app.data.model

data class SubscriptionPlan(
    val id: String,
    val name: String,
    val price: Float,
    val duration: String, // "month" or "year"
    val features: List<String>
)

sealed class SubscriptionStatus {
    object Inactive : SubscriptionStatus()
    data class Active(val expiresAt: Long) : SubscriptionStatus()
    data class Cancelled(val expiresAt: Long) : SubscriptionStatus()
}