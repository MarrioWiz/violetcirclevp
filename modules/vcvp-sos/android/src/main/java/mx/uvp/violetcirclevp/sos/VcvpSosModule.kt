package mx.uvp.violetcirclevp.sos

import android.Manifest
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.os.Build
import android.provider.Settings
import android.telephony.SmsManager
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class VcvpSosModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw CodedException("NO_CONTEXT", "Sin contexto de Android", null)

  override fun definition() = ModuleDefinition {
    Name("VcvpSos")

    // ── SMS automático ────────────────────────────────────────────────────
    AsyncFunction("sendSms") { phones: List<String>, message: String ->
      if (context.checkSelfPermission(Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
        throw CodedException("NO_SMS_PERMISSION", "Falta el permiso para enviar SMS", null)
      }
      val sms: SmsManager =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          context.getSystemService(SmsManager::class.java)
        } else {
          @Suppress("DEPRECATION")
          SmsManager.getDefault()
        }
      val parts = sms.divideMessage(message)
      var sent = 0
      for (phone in phones) {
        try {
          sms.sendMultipartTextMessage(phone, null, parts, null, null)
          sent++
        } catch (_: Exception) {
          // Se sigue con las demás personas.
        }
      }
      sent
    }

    // ── Botones de volumen (servicio de accesibilidad) ────────────────────
    Function("isVolumeTriggerEnabled") {
      val enabled = Settings.Secure.getString(
        context.contentResolver,
        Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
      ) ?: ""
      val me = ComponentName(context, VolumeSosService::class.java)
      enabled.split(':').any { ComponentName.unflattenFromString(it) == me }
    }

    Function("openAccessibilitySettings") {
      context.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }

    // ── Entrada "Pedir ayuda" para botón lateral / Quick Tap ──────────────
    Function("isLauncherEntryEnabled") {
      context.packageManager.getComponentEnabledSetting(launcherComponent()) ==
        PackageManager.COMPONENT_ENABLED_STATE_ENABLED
    }

    Function("setLauncherEntryEnabled") { enabled: Boolean ->
      context.packageManager.setComponentEnabledSetting(
        launcherComponent(),
        if (enabled) PackageManager.COMPONENT_ENABLED_STATE_ENABLED else PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
        PackageManager.DONT_KILL_APP,
      )
    }

    // ── Atajo al mantener presionado el ícono ─────────────────────────────
    Function("setIconShortcutEnabled") { enabled: Boolean ->
      val manager = context.getSystemService(ShortcutManager::class.java)
      if (manager != null) {
        if (enabled) {
          val shortcut = ShortcutInfo.Builder(context, SHORTCUT_ID)
            .setShortLabel("Pedir ayuda")
            .setLongLabel("Pedir ayuda")
            .setIcon(Icon.createWithResource(context, context.applicationInfo.icon))
            .setIntent(SosTrigger.intent(context))
            .build()
          manager.dynamicShortcuts = listOf(shortcut)
        } else {
          manager.removeDynamicShortcuts(listOf(SHORTCUT_ID))
        }
      }
      manager != null
    }

    Function("isIconShortcutEnabled") {
      val manager = context.getSystemService(ShortcutManager::class.java)
      manager?.dynamicShortcuts?.any { it.id == SHORTCUT_ID } ?: false
    }

    // ── Mostrar la pantalla de ayuda sobre la pantalla bloqueada ──────────
    AsyncFunction("setShowWhenLocked") { on: Boolean ->
      val activity = appContext.currentActivity
      if (activity != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        activity.runOnUiThread {
          activity.setShowWhenLocked(on)
          activity.setTurnScreenOn(on)
        }
      }
      activity != null
    }
  }

  private fun launcherComponent() = ComponentName(context, SosLauncherActivity::class.java)

  companion object {
    const val SHORTCUT_ID = "vcvp_sos"
  }
}
