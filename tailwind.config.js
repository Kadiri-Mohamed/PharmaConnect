/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx}',
    ],
    theme: {
        extend: {
            colors: {
                pharmacy: {
                    light: '#B3D7E0',
                    lighter: '#7FB3C1',
                    medium: '#4A9BBE',
                    dark: '#2A7A9D',
                    deepest: '#1A4D6D',
                },
            },
            boxShadow: {
                pharmacy: '0 20px 45px -30px rgba(26, 77, 109, 0.32)',
                'pharmacy-lg': '0 28px 60px -34px rgba(42, 122, 157, 0.34)',
            },
        },
    },
    plugins: [],
};
