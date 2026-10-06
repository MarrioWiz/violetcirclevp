package mx.uvp.violetcirclevp.sos

import android.content.Context
import android.content.Intent
import android.net.Uri

/** Abre la pantalla "Pedir ayuda" de la app (ruta violetcirclevp://sos). */
object SosTrigger {
  const val SOS_URI = "violetcirclevp://sos"

  fun intent(context: Context): Intent =
    Intent(Intent.ACTION_VIEW, Uri.parse(SOS_URI)).apply {
      setPackage(context.packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }

  fun launch(context: Context) {
    context.startActivity(intent(context))
  }
}
