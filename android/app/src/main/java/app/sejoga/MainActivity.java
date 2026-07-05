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

    private static final int STATUS_BAR_COLOR = 0xFF0096FF;
    private static final String WEB_BASE = "https://sejoga.app";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureStatusBar();
        handleDeepLink(getIntent(), "onCreate");
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLink(intent, "onNewIntent");
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

    private void handleDeepLink(Intent intent, String origem) {
        String scheme = null, host = null, query = null, frag = null, action = null;
        String dataStr = null;

        if (intent != null) {
            action = intent.getAction();
            Uri data = intent.getData();
            if (data != null) {
                scheme = data.getScheme();
                host = data.getHost();
                query = data.getQuery();
                frag = data.getFragment();
                dataStr = data.toString();
            }
        }

        // Se tem token no query OU no fragmento, redireciona pro callback
        String tokenPart = null;
        if (query != null && (query.contains("token_hash") || query.contains("code"))) {
            tokenPart = query;
        } else if (frag != null && (frag.contains("token_hash") || frag.contains("code"))) {
            tokenPart = frag;
        }

        if (tokenPart != null) {
            final String webUrl = WEB_BASE + "/auth/callback?" + tokenPart;
            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                if (bridge != null && bridge.getWebView() != null) {
                    bridge.getWebView().loadUrl(webUrl);
                }
            }, 1500);
            return;
        }

        // Só mostra debug se veio de um deep link real (não da abertura normal MAIN)
        if (dataStr == null) {
            // abertura normal, sem URL — nao faz nada
            return;
        }

        final String dbg = "origem=" + origem + " action=" + action
            + " | scheme=" + scheme + " host=" + host
            + " | query=" + query + " | frag=" + frag
            + " | full=" + dataStr;

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (bridge != null && bridge.getWebView() != null) {
                String html = "data:text/html,<body style='font-family:monospace;padding:20px;font-size:13px;word-break:break-all'>"
                    + "<h3>DEEP LINK DEBUG</h3><p>" + Uri.encode(dbg) + "</p></body>";
                bridge.getWebView().loadUrl(html);
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