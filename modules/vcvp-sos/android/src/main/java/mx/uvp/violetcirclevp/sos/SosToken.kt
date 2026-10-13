package mx.uvp.violetcirclevp.sos

import android.content.Context
import java.security.MessageDigest
import java.security.SecureRandom

/**
 * Clave secreta de esta instalación para la alerta. Solo la conocen los disparadores propios
 * (volumen, atajo, entrada del botón lateral). Un enlace violetcirclevp://sos que llegue de otra
 * app o de un mensaje NO la trae, así que no puede activar la alerta ni enviar SMS.
 */
object SosToken {
  private const val PREFS = "vcvp_sos"
  private const val KEY = "trigger_token"

  fun get(context: Context): String {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    prefs.getString(KEY, null)?.let { return it }
    val bytes = ByteArray(24).also { SecureRandom().nextBytes(it) }
    val token = bytes.joinToString("") { "%02x".format(it) }
    prefs.edit().putString(KEY, token).apply()
    return token
  }

  /** Comparación en tiempo constante. */
  fun isValid(context: Context, candidate: String?): Boolean {
    if (candidate.isNullOrEmpty()) return false
    return MessageDigest.isEqual(candidate.toByteArray(), get(context).toByteArray())
  }
}
