package mx.uvp.violetcirclevp.sos

import android.content.Context
import android.content.Intent
import android.net.Uri

/** Abre la pantalla "Pedir ayuda" de la app (ruta violetcirclevp://sos). */
object SosTrigger {
  const val SOS_URI = "violetcirclevp://sos"

  /**
   * `seconds`: segundos para cancelar (null = los 10 de siempre). Siempre lleva la clave secreta
   * (`k`): sin ella la app ignora el enlace.
   */
  fun intent(context: Context, seconds: Int? = null): Intent {
    val query = buildString {
      append("k=").append(SosToken.get(context))
      if (seconds != null) append("&t=").append(seconds)
    }
    return Intent(Intent.ACTION_VIEW, Uri.parse("$SOS_URI?$query")).apply {
      setPackage(context.packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
  }

  fun launch(context: Context, seconds: Int? = null) {
    context.startActivity(intent(context, seconds))
  }
}
