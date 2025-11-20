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
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {
    
    private SwipeRefreshLayout swipeRefreshLayout;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupStatusBar();
        setupEdgeToEdge();
        setupPullToRefresh();
    }
    
    @Override
    public void onStart() {
        super.onStart();
        setupPullToRefresh();
    }
    
    @Override
    public void onResume() {
        super.onResume();
        setupStatusBar();
    }
    
    private void setupStatusBar() {
        Window window = getWindow();
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.parseColor("#0096FF"));
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.show(WindowInsets.Type.statusBars());
                controller.setSystemBarsAppearance(0, 
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            View decorView = window.getDecorView();
            int flags = decorView.getSystemUiVisibility();
            flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            decorView.setSystemUiVisibility(flags);
        }
    }
    
    private void setupEdgeToEdge() {
        Window window = getWindow();
        View decorView = window.getDecorView();
        
        WindowCompat.setDecorFitsSystemWindows(window, false);
        
        ViewCompat.setOnApplyWindowInsetsListener(decorView, (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(0, systemBars.top, 0, 0);
            return insets;
        });
    }
    
    private void setupPullToRefresh() {
        Bridge bridge = getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                // Habilita overscroll
                webView.setOverScrollMode(View.OVER_SCROLL_ALWAYS);
                
                // Configurações do WebView
                WebSettings settings = webView.getSettings();
                settings.setDomStorageEnabled(true);
                
                // Detecta scroll no topo e permite refresh
                webView.setOnScrollChangeListener((v, scrollX, scrollY, oldScrollX, oldScrollY) -> {
                    if (scrollY == 0) {
                        webView.setOverScrollMode(View.OVER_SCROLL_ALWAYS);
                    }
                });
            }
        }
        
        // Tenta configurar SwipeRefreshLayout se existir
        try {
            swipeRefreshLayout = findViewById(R.id.swiperefresh);
            if (swipeRefreshLayout != null) {
                swipeRefreshLayout.setColorSchemeColors(Color.parseColor("#0096FF"));
                swipeRefreshLayout.setOnRefreshListener(() -> {
                    if (bridge != null && bridge.getWebView() != null) {
                        bridge.getWebView().reload();
                        swipeRefreshLayout.setRefreshing(false);
                    }
                });
            }
        } catch (Exception e) {
            // SwipeRefreshLayout não configurado, ignora
        }
    }
}