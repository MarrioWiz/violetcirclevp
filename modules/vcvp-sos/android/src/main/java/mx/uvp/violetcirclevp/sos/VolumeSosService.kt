package mx.uvp.violetcirclevp.sos

import android.accessibilityservice.AccessibilityService
import android.os.SystemClock
import android.util.Log
import android.view.KeyEvent
import android.view.accessibility.AccessibilityEvent

/**
 * Servicio de accesibilidad que SOLO escucha el botón de bajar volumen.
 * Tres pulsaciones seguidas (en menos de 2 s) abren la pantalla "Pedir ayuda".
 * No lee la pantalla ni otras teclas, y no bloquea el volumen (devuelve false).
 */
class VolumeSosService : AccessibilityService() {
  private val presses = ArrayDeque<Long>()

  override fun onKeyEvent(event: KeyEvent): Boolean {
    if (event.keyCode == KeyEvent.KEYCODE_VOLUME_DOWN &&
      event.action == KeyEvent.ACTION_DOWN &&
      event.repeatCount == 0
    ) {
      val now = SystemClock.uptimeMillis()
      presses.addLast(now)
      while (presses.isNotEmpty() && now - presses.first() > WINDOW_MS) presses.removeFirst()
      if (presses.size >= PRESSES) {
        presses.clear()
        try {
          SosTrigger.launch(this)
        } catch (e: Exception) {
          // Si el sistema no permite abrir la app en este momento, no hacemos nada.
          Log.w("VCVP-SOS", "launch failed: ${e.javaClass.simpleName}")
        }
      }
    }
    return false
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {}

  override fun onInterrupt() {}

  companion object {
    const val PRESSES = 3
    const val WINDOW_MS = 2000L
  }
}
