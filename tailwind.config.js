import typography from '@tailwindcss/typography';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],
    theme: {
        extend: {
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            colors: {
                // This keeps your shadcn colors working
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                border: 'hsl(var(--border))',
            },
            typography: {
                DEFAULT: {
                    css: {
                        'ul > li': { paddingLeft: '1.5em' },
                        'ul': { listStyleType: 'disc' },
                        'ol': { listStyleType: 'decimal' },
                        'hr': {
                            borderColor: 'hsl(var(--border))',
                            marginTop: '2em',
                            marginBottom: '2em',
                        },
                    },
                },
            },
        }
    },
    plugins: [animate, typography],
}
