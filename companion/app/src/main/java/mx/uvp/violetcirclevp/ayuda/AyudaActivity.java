package mx.uvp.violetcirclevp.ayuda;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.widget.Toast;

/**
 * Abre la alerta "Pedir ayuda" de VioletCircleVP (violetcirclevp://sos?t=4: 4 s para cancelar)
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
        Intent sos = new Intent(Intent.ACTION_VIEW, Uri.parse("violetcirclevp://sos?t=" + SECONDS))
                .setPackage(MAIN_PACKAGE)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        try {
            startActivity(sos);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, R.string.missing_app, Toast.LENGTH_LONG).show();
        }
        finish();
    }
}
