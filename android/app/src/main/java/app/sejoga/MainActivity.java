package app.sejoga;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int STATUS_BAR_COLOR = 0xFF0096FF; // #0096FF
    private static final String WEB_BASE = "https://sejoga.app";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureStatusBar();
        handleDeepLink(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLink(intent);
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

    // Captura o deep link de confirmação de e-mail e leva o webview
    // para a rota de callback, que confirma a conta e cria a sessão.
    private void handleDeepLink(Intent intent) {
        if (intent == null) return;

        Uri data = intent.getData();
        if (data == null) return;

        String query = data.getQuery();
        if (query == null && data.getFragment() != null) {
            query = data.getFragment();
        }

        if (query == null || query.isEmpty()) return;
        if (!query.contains("token_hash") && !query.contains("code")) return;

        final String webUrl = WEB_BASE + "/auth/callback?" + query;

        // Pequeno atraso para rodar depois que o Capacitor carrega a home.
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().loadUrl(webUrl);
            }
        }, 1500);
    }

    private void configureStatusBar() {
        Window window = getWindow();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);

            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);

            window.setStatusBarColor(STATUS_BAR_COLOR);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
                WindowCompat.setDecorFitsSystemWindows(window, true);
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                WindowInsetsControllerCompat controller =
                    new WindowInsetsControllerCompat(window, window.getDecorView());
                controller.setAppearanceLightStatusBars(false);
            }
        }
    }
}