package mx.uvp.violetcirclevp.sos

import android.app.Activity
import android.os.Bundle

/**
 * Entrada "Pedir ayuda" que aparece como app en el teléfono (desactivada por defecto).
 * Sirve para asignarla al botón lateral (Samsung) o a Quick Tap (Pixel): abre directo la
 * pantalla de ayuda y se cierra sin mostrar nada.
 */
class SosLauncherActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    SosTrigger.launch(this)
    finish()
  }
}
