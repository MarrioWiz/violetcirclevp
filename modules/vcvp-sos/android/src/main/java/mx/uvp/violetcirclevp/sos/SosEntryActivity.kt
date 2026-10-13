package mx.uvp.violetcirclevp.sos

import android.app.Activity
import android.os.Build
import android.os.Bundle

/**
 * Entrada para la mini app "Pedir ayuda". Está protegida con un permiso de firma: solo apps
 * firmadas con la misma llave que VioletCircleVP pueden abrirla. Agrega la clave secreta y abre
 * la alerta (sobre la pantalla bloqueada si hace falta).
 */
class SosEntryActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    }
    val seconds = intent?.getIntExtra(EXTRA_SECONDS, 0)?.takeIf { it in 3..30 }
    SosTrigger.launch(this, seconds)
    finish()
  }

  companion object {
    const val EXTRA_SECONDS = "seconds"
  }
}
