// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx,js,jsx}",
        "./components/**/*.{ts,tsx,js,jsx}",
        "./app/**/*.{ts,tsx,js,jsx}",
        "./src/**/*.{ts,tsx,js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                // ... existing colors
                brand: {
                    DEFAULT: '#581c87', // purple-900
                    // ... existing shades
                    950: '#3b0764',
                    // New Custom Colors replacing hardcoded hex
                    dark: '#0a0514',      // Was #0a0514
                    black: '#06070D',     // Was #06070D
                }
            },
            // ... existing config
        }
    },
    // ...
};
