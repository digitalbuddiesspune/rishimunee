# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# react-native-webrtc / jitsi webrtc (guards release builds if minify is enabled)
-keep class com.oney.WebRTCModule.** { *; }
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**

# react-native-incall-manager
-keep class com.zxcpoiu.incallmanager.** { *; }
