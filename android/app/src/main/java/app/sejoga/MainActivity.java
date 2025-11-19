package app.sejoga;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupStatusBar();
    }
    
    @Override
    public void onResume() {
        super.onResume();
        setupStatusBar();
    }
    
    private void setupStatusBar() {
        Window window = getWindow();
        View decorView = window.getDecorView();
        
        // Para Android 5.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.parseColor("#0096FF"));
        }
        
        // Para Android 11+ (incluindo 13 e 16)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Força o sistema a mostrar a status bar
            WindowCompat.setDecorFitsSystemWindows(window, true);
            
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                // Garante que a status bar está visível
                controller.show(WindowInsets.Type.statusBars());
                // Ícones brancos na status bar
                controller.setSystemBarsAppearance(0, 
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Para Android 6-10
            int flags = decorView.getSystemUiVisibility();
            flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            decorView.setSystemUiVisibility(flags);
        }
    }
}