/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.tsx',
    ],
    theme: {
        extend: {
            colors: {
                background: '#F4F7ED',
                primary: '#2E6E65',
                secondary: '#2B3752',
                dark: {
                    background: '#1E293B',
                    card: '#334155',
                    text: '#F1F5F9',
                    accent: '#4CAF50',
                }
            }
        },
    },
    plugins: [],
};
