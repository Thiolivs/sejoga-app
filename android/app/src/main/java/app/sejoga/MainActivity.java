package app.sejoga;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
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
        // App aberto a partir de um deep link (estava fechado)
        handleDeepLink(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        // App já estava aberto e recebeu um deep link
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

    private void handleDeepLink(Intent intent) {
        if (intent == null) return;

        Uri data = intent.getData();
        if (data == null) return;

        // Só trata o esquema customizado app.sejoga://
        if (!"app.sejoga".equals(data.getScheme())) return;

        String query = data.getQuery(); // ex: token_hash=...&type=signup
        if (query == null || query.isEmpty()) return;

        // Redireciona o webview para a rota server-side de callback,
        // que processa o token e cria a sessão.
        final String webUrl = WEB_BASE + "/auth/callback?" + query;

        runOnUiThread(() -> {
            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().loadUrl(webUrl);
            }
        });
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