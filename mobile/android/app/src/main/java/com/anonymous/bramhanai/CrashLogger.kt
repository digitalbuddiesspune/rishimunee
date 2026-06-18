package com.anonymous.bramhanai

import android.app.Application
import android.content.Context
import java.io.PrintWriter
import java.io.StringWriter
import java.util.Date
import java.util.concurrent.atomic.AtomicBoolean

object CrashLogger {
  private const val PREFS_NAME = "native_crash_logger"
  private const val KEY_LAST_CRASH = "last_crash"
  private val installed = AtomicBoolean(false)

  fun install(application: Application) {
    if (!installed.compareAndSet(false, true)) return
    val previousHandler = Thread.getDefaultUncaughtExceptionHandler()
    Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
      try {
        persistCrash(application, thread, throwable)
      } catch (_: Throwable) {
      } finally {
        previousHandler?.uncaughtException(thread, throwable)
      }
    }
  }

  fun getLastCrash(context: Context): String? {
    return context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(KEY_LAST_CRASH, null)
  }

  fun clearLastCrash(context: Context) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(KEY_LAST_CRASH)
      .apply()
  }

  private fun persistCrash(context: Context, thread: Thread, throwable: Throwable) {
    val writer = StringWriter()
    val printWriter = PrintWriter(writer)
    throwable.printStackTrace(printWriter)
    printWriter.flush()

    val payload = buildString {
      append("Captured at: ").append(Date()).append('\n')
      append("Thread: ").append(thread.name).append('\n')
      append("Exception: ").append(throwable.javaClass.name).append('\n')
      append("Message: ").append(throwable.message ?: "n/a").append('\n')
      append('\n')
      append(writer.toString())
    }

    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_LAST_CRASH, payload)
      .apply()
  }
}
