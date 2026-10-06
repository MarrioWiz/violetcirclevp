package mx.uvp.violetcirclevp.ayuda;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Toast;

/**
 * Abre la alerta "Pedir ayuda" de VioletCircleVP (violetcirclevp://sos, cuenta regresiva de
 * 10 s para cancelar) y se cierra sin mostrar nada.
 */
public class AyudaActivity extends Activity {
    private static final String MAIN_PACKAGE = "mx.uvp.violetcirclevp";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent sos = new Intent(Intent.ACTION_VIEW, Uri.parse("violetcirclevp://sos"))
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
