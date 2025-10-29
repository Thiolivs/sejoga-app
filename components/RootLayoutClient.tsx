"use client";

import { useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";

export function RootLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);

    return (
        <>
            {loading && (
                <SplashScreen
                    onFinish={() => setLoading(false)}
                    logoUrl="/sejoga-id/White512.png"
                />
            )}
            {!loading && children}
        </>
    );
}
