package mx.uvp.violetcirclevp.ayuda;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ComponentName;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.widget.Toast;

/**
 * Abre la alerta "Pedir ayuda" de VioletCircleVP (4 s para cancelar) por su entrada protegida
 * y se cierra sin mostrar nada. Funciona con el teléfono bloqueado: se muestra sobre la
 * pantalla de bloqueo y la app principal hace lo mismo al recibir el enlace.
 */
public class AyudaActivity extends Activity {
    private static final String MAIN_PACKAGE = "mx.uvp.violetcirclevp";
    /** Segundos para cancelar cuando se abre desde el botón lateral. */
    private static final int SECONDS = 4;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        }
        // Entrada protegida (permiso de firma): agrega la clave secreta y abre la alerta.
        Intent sos = new Intent()
                .setComponent(new ComponentName(MAIN_PACKAGE, MAIN_PACKAGE + ".sos.SosEntryActivity"))
                .putExtra("seconds", SECONDS)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            startActivity(sos);
        } catch (ActivityNotFoundException | SecurityException e) {
            Toast.makeText(this, R.string.missing_app, Toast.LENGTH_LONG).show();
        }
        finish();
    }
}
