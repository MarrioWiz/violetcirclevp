package mx.uvp.violetcirclevp.sos

import android.app.Activity
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import expo.modules.core.interfaces.ReactActivityLifecycleListener
import java.lang.ref.WeakReference

/**
 * Si la app se abre con violetcirclevp://sos (mini app del botón lateral, volumen o atajo),
 * la ventana se muestra SOBRE la pantalla bloqueada y enciende la pantalla desde el primer
 * momento, antes de que cargue la interfaz. Sin esto, Android la deja detrás del bloqueo.
 * No quita el bloqueo: al cerrar la alerta, la pantalla de JS lo vuelve a desactivar.
 */
class SosLockScreenListener : ReactActivityLifecycleListener {
  private var activity: WeakReference<Activity>? = null

  override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
    this.activity = WeakReference(activity)
    showOverLockIfSos(activity, activity.intent)
  }

  override fun onResume(activity: Activity) {
    this.activity = WeakReference(activity)
  }

  override fun onNewIntent(intent: Intent): Boolean {
    activity?.get()?.let { showOverLockIfSos(it, intent) }
    return false
  }

  private fun showOverLockIfSos(activity: Activity, intent: Intent?) {
    val data = intent?.data ?: return
    if (data.scheme != "violetcirclevp" || data.host != "sos") return
    activity.runOnUiThread {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        activity.setShowWhenLocked(true)
        activity.setTurnScreenOn(true)
      } else {
        @Suppress("DEPRECATION")
        activity.window.addFlags(
          WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
        )
      }
      // La pantalla se queda encendida mientras corre la cuenta regresiva.
      activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }
  }
}
