import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                brand: {
                    orange: '#EF4D23', // Bright Gofo Orange
                    cream: '#FFFBF0', // Off-white Background
                    dark: '#1B1F22', // Dark background
                }
            },
        },
    },
    plugins: [],
};
export default config;
