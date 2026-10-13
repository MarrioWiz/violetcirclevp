package mx.uvp.violetcirclevp.sos

import android.content.Context
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

/** Registra el listener que muestra la alerta sobre la pantalla bloqueada. */
class VcvpSosPackage : Package {
  override fun createReactActivityLifecycleListeners(activityContext: Context?): List<ReactActivityLifecycleListener> =
    listOf(SosLockScreenListener())
}
