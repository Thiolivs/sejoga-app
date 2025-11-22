'use client';

import { useEffect, useState } from 'react';

export function useAndroidModern() {
    const [isAndroidModern, setIsAndroidModern] = useState(false);

    useEffect(() => {
        setIsAndroidModern(document.documentElement.classList.contains('android-modern'));
    }, []);

    return isAndroidModern;
}