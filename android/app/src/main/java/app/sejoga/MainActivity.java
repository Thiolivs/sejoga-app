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

    private void handleDeepLink(Intent intent) {
        String debugInfo;

        if (intent == null) {
            debugInfo = "intent NULL";
        } else {
            Uri data = intent.getData();
            if (data == null) {
                debugInfo = "data NULL, action=" + intent.getAction();
            } else {
                debugInfo = "scheme=" + data.getScheme()
                    + " host=" + data.getHost()
                    + " query=" + data.getQuery()
                    + " frag=" + data.getFragment();

                String scheme = data.getScheme();
                String query = data.getQuery();

                if (query == null && data.getFragment() != null) {
                    query = data.getFragment();
                }

                if (("app.sejoga".equals(scheme) || "https".equals(scheme))
                        && query != null && !query.isEmpty()
                        && (query.contains("token_hash") || query.contains("code"))) {

                    final String webUrl = WEB_BASE + "/auth/callback?" + query;

                    // Atraso para rodar DEPOIS que o Capacitor carregou a home
                    new Handler(Looper.getMainLooper()).postDelayed(() -> {
                        if (bridge != null && bridge.getWebView() != null) {
                            bridge.getWebView().loadUrl(webUrl);
                        }
                    }, 1200);

                    return;
                }
            }
        }

        // DEBUG: mostra o que foi capturado, carregando uma página de teste visual
        final String dbg = debugInfo;
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (bridge != null && bridge.getWebView() != null) {
                String html = "data:text/html,<body style='font-family:monospace;padding:20px;font-size:14px'>"
                    + "<h3>DEEP LINK DEBUG</h3><p>" + Uri.encode(dbg) + "</p></body>";
                bridge.getWebView().loadUrl(html);
            }
        }, 1200);
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