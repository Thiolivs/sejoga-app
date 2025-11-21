package app.sejoga;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    private static final int STATUS_BAR_COLOR = 0xFF0096FF; // #0096FF
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureStatusBar();
    }
    
    @Override
    public void onResume() {
        super.onResume();
        configureStatusBar();
    }
    
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            configureStatusBar();
        }
    }
    
    private void configureStatusBar() {
        Window window = getWindow();
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // Remove flags problemáticas
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
            
            // Adiciona flag para desenhar status bar
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            
            // Define cor azul
            window.setStatusBarColor(STATUS_BAR_COLOR);
            
            // ✅ NOVO: Para Android 15+ (edge-to-edge)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
                // Desabilita edge-to-edge automático
                WindowCompat.setDecorFitsSystemWindows(window, true);
            }
            
            // Ícones brancos (para fundo azul)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                WindowInsetsControllerCompat controller = 
                    new WindowInsetsControllerCompat(window, window.getDecorView());
                controller.setAppearanceLightStatusBars(false); // Ícones brancos
            }
        }
    }
}