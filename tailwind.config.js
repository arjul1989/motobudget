/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#facc14", // Safety Yellow
                "primary-dark": "#eab308",
                "background-light": "#f8f8f5",
                "background-dark": "#121212", // Deep Asphalt
                "surface-dark": "#1E1E1E", // Card Background
                "surface-highlight": "#2C2C2C",
                "text-dim": "#9ca3af",
                "dark-asphalt": "#1a1a1a",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "body": ["Noto Sans", "sans-serif"],
            },
            backgroundImage: {
                'asphalt': "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.05%22/%3E%3C/svg%3E')",
            }
        },
    },
    plugins: [],
}
