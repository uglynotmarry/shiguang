package com.timepostoffice.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// 宫崎骏风格配色方案
private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF8B4513),           // 温暖的大地色
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFFFDBCB),
    onPrimaryContainer = Color(0xFF341100),
    
    secondary = Color(0xFF4A7C59),         // 森林绿
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFCBEAD4),
    onSecondaryContainer = Color(0xFF05210D),
    
    tertiary = Color(0xFF6B5B73),          // 柔和的紫灰色
    onTertiary = Color(0xFFFFFFFF),
    tertiaryContainer = Color(0xFFF2DAFF),
    onTertiaryContainer = Color(0xFF251431),
    
    error = Color(0xFFBA1A1A),
    errorContainer = Color(0xFFFFDAD6),
    onError = Color(0xFFFFFFFF),
    onErrorContainer = Color(0xFF410002),
    
    background = Color(0xFFFFFBFF),
    onBackground = Color(0xFF201A17),
    
    surface = Color(0xFFFFF8F5),
    onSurface = Color(0xFF201A17),
    surfaceVariant = Color(0xFFF4DED4),
    onSurfaceVariant = Color(0xFF52443D),
    
    outline = Color(0xFF85746C),
    outlineVariant = Color(0xFFD8C2B8),
    scrim = Color(0xFF000000),
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFFFFB68C),
    onPrimary = Color(0xFF532200),
    primaryContainer = Color(0xFF6A3306),
    onPrimaryContainer = Color(0xFFFFDBCB),
    
    secondary = Color(0xFFAFD3B8),
    onSecondary = Color(0xFF183726),
    secondaryContainer = Color(0xFF2F4E3C),
    onSecondaryContainer = Color(0xFFCBEAD4),
    
    tertiary = Color(0xFFD5BEE5),
    onTertiary = Color(0xFF3A2A47),
    tertiaryContainer = Color(0xFF52405E),
    onTertiaryContainer = Color(0xFFF2DAFF),
    
    error = Color(0xFFFFB4AB),
    errorContainer = Color(0xFF93000A),
    onError = Color(0xFF690005),
    onErrorContainer = Color(0xFFFFDAD6),
    
    background = Color(0xFF201A17),
    onBackground = Color(0xFFECE0DA),
    
    surface = Color(0xFF201A17),
    onSurface = Color(0xFFECE0DA),
    surfaceVariant = Color(0xFF52443D),
    onSurfaceVariant = Color(0xFFD8C2B8),
    
    outline = Color(0xFFA08D84),
    outlineVariant = Color(0xFF52443D),
    scrim = Color(0xFF000000),
)

@Composable
fun TimePostOfficeTheme(
    darkTheme: Boolean = false, // 宫崎骏风格更适合明亮主题
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}