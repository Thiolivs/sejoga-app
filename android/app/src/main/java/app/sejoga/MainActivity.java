package app.sejoga;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupStatusBar();
        enablePullToRefresh();
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
            window.clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.parseColor("#0096FF"));
        }
        
        // Para Android 11+ - NÃO usar edge-to-edge
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // ✅ MUDANÇA: setDecorFitsSystemWindows = TRUE
            WindowCompat.setDecorFitsSystemWindows(window, true);
            
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.show(WindowInsets.Type.statusBars());
                // Ícones brancos na status bar azul
                controller.setSystemBarsAppearance(0, 
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Android 6-10: ícones brancos
            int flags = decorView.getSystemUiVisibility();
            flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            decorView.setSystemUiVisibility(flags);
        }
    }
    
    private void enablePullToRefresh() {
        Bridge bridge = getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                webView.setOverScrollMode(View.OVER_SCROLL_ALWAYS);
                
                WebSettings settings = webView.getSettings();
                settings.setDomStorageEnabled(true);
                
                webView.setOnScrollChangeListener((v, scrollX, scrollY, oldScrollX, oldScrollY) -> {
                    if (scrollY == 0) {
                        webView.setOverScrollMode(View.OVER_SCROLL_ALWAYS);
                    }
                });
            }
        }
    }
}