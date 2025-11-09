import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                poppins: ['var(--font-poppins)', 'sans-serif'],
            },
            colors: {
                'sejoga-vermelho-oficial': '#DD2228',
                'sejoga-laranja-oficial': '#F48429',
                'sejoga-amarelo-oficial': '#ECE950',
                'sejoga-verde-oficial': '#7BC244',
                'sejoga-azul-oficial': '#3AC3DF',
                'sejoga-rosa-oficial': '#EC0577',

                'sejoga-vermelho-chiclete': '#FF3131',
                'sejoga-laranja-chiclete': '#F6BB42',
                'sejoga-amarelo-chiclete': '#F0FD71',
                'sejoga-verde-chiclete': '#8AD84D',
                'sejoga-azul-chiclete': '#5CE1E6',
                'sejoga-rosa-chiclete': '#FA4EB0',

                'sejoga-vermelho-giz': '#FF6060',
                'sejoga-laranja-giz': '#Fbc758',
                'sejoga-amarelo-giz': '#FFFF8A',
                'sejoga-verde-giz': '#A2F263',
                'sejoga-azul-giz': '#95FBFF',
                'sejoga-rosa-giz': '#FF8ED3'
            },
        },
    },
    plugins: [],
};

export default config;