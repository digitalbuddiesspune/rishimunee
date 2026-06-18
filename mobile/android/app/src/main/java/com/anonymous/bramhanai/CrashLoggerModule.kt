package com.anonymous.bramhanai

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class CrashLoggerModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName(): String = "CrashLogger"

  @ReactMethod
  fun getLastCrash(promise: Promise) {
    promise.resolve(CrashLogger.getLastCrash(context))
  }

  @ReactMethod
  fun clearLastCrash() {
    CrashLogger.clearLastCrash(context)
  }
}
