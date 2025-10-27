'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
    onFinish: () => void;
    logoUrl?: string; // URL da logo do SeJoga
}

export function SplashScreen({ onFinish, logoUrl }: SplashScreenProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Após 1.7 segundos, inicia o fade out
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 3700);

        // Após 2 segundos, esconde completamente e chama onFinish
        const hideTimer = setTimeout(() => {
            setIsVisible(false);
            onFinish();
        }, 4000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(hideTimer);
        };
    }, [onFinish]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-rainbow transition-opacity duration-300 ${
                fadeOut ? 'opacity-0' : 'opacity-100'
            }`}
        >
            <div className="text-center">
                {/* Logo saltando */}
                {logoUrl ? (
                    <div className="animate-jump-around">
                        <img
                            src={logoUrl}
                            alt="SeJoga Logo"
                            className="w-48 h-48 mx-auto object-contain drop-shadow-2xl"
                        />
                    </div>
                ) : (
                    <div className="animate-jump-around mb-8">
                        <div className="w-32 h-32 mx-auto bg-white rounded-3xl shadow-2xl flex items-center justify-center">
                            <span className="text-6xl">🎲</span>
                        </div>
                    </div>
                )}

                {/* Título */}
                <h1 className="text-4xl font-bold text-blue-950 mb-4 animate-fade-in-up tracking-wider drop-shadow-lg">
                    SeJoga
                </h1>

                {/* Subtítulo */}
                <p className="text-xl text-purple-900 animate-fade-in-up-delay font-light drop-shadow">
                    <i>Seu evento de Diversidade<br/> nos Jogos de Mesa</i>
                </p>

                {/* Loading dots */}
                <div className="flex justify-center gap-2 mt-8">
                    <div className="w-3 h-3 bg-gray-100 rounded-full animate-bounce-1 shadow-lg"></div>
                    <div className="w-3 h-3 bg-gray-100 rounded-full animate-bounce-2 shadow-lg"></div>
                    <div className="w-3 h-3 bg-gray-100 rounded-full animate-bounce-3 shadow-lg"></div>
                </div>
            </div>

            {/* Animações customizadas */}
            <style jsx>{`
                .bg-gradient-rainbow {
                    background: linear-gradient(
                        135deg,
                        #FFB3BA 0%,      /* Vermelho pastel */
                        #FFDFBA 14.28%,  /* Laranja pastel */
                        #FFFFBA 28.56%,  /* Amarelo pastel */
                        #BAFFC9 42.84%,  /* Verde pastel */
                        #BAE1FF 57.12%,  /* Azul pastel */
                        #C9BAFF 71.4%,   /* Índigo pastel */
                        #FFBAF3 85.68%,  /* Violeta pastel */
                        #FFB3BA 100%     /* Volta pro vermelho pastel */
                    );
                    background-size: 100% 100%;
                    animation: rainbow-shift 4s ease-in-out infinite;
                }

                @keyframes rainbow-shift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes jump-around {
                    0% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    15% {
                        transform: translate(30px, -40px) rotate(15deg);
                    }
                    30% {
                        transform: translate(-20px, -30px) rotate(-10deg);
                    }
                    45% {
                        transform: translate(25px, -45px) rotate(20deg);
                    }
                    60% {
                        transform: translate(-30px, -35px) rotate(-15deg);
                    }
                    75% {
                        transform: translate(15px, -40px) rotate(10deg);
                    }
                    90% {
                        transform: translate(-10px, -30px) rotate(-5deg);
                    }
                    100% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                }

                .animate-jump-around {
                    animation: jump-around 4s ease-in-out infinite;
                }

                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 3s ease-out;
                }

                .animate-fade-in-up-delay {
                    animation: fade-in-up 2s ease-out 0.2s both;
                }

                .animate-bounce-1 {
                    animation: bounce 1s ease-in-out infinite;
                }

                .animate-bounce-2 {
                    animation: bounce 1s ease-in-out 0.2s infinite;
                }

                .animate-bounce-3 {
                    animation: bounce 1s ease-in-out 0.4s infinite;
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
        </div>
    );
}