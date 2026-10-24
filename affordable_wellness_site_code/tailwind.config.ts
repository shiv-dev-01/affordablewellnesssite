  import type { Config } from "tailwindcss";

  export default {
    darkMode: ["class"],
    content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    prefix: "",
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        fontFamily: {
          sans: ['Hanken Grotesk', 'Manrope', 'Inter', 'sans-serif'],
          heading: ['Poppins', 'Manrope', 'sans-serif'],
        },
        colors: {
          navy: {
            DEFAULT: '#2D476F',
            dark: '#243247',
            light: '#354B6E',
          },
          lime: {
            DEFAULT: '#F5FB98',
            bright: '#F0FCA7',
          },
          highlight: {
            DEFAULT: 'lab(92.1309 -22.6008 64.7106)',
            foreground: 'lab(16.1918 -1.86399 -20.4995)',
            icon: 'lab(62.5 -14.2 48.3)',
          },
          cream: '#F2F0EE',
          'blue-card': '#E0E6EF',
          'section-gray': '#F9F9F9',
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
          sidebar: {
            DEFAULT: "hsl(var(--sidebar-background))",
            foreground: "hsl(var(--sidebar-foreground))",
            primary: "hsl(var(--sidebar-primary))",
            "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
            accent: "hsl(var(--sidebar-accent))",
            "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
            border: "hsl(var(--sidebar-border))",
            ring: "hsl(var(--sidebar-ring))",
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        keyframes: {
          "accordion-down": {
            from: {
              height: "0",
            },
            to: {
              height: "var(--radix-accordion-content-height)",
            },
          },
          "accordion-up": {
            from: {
              height: "var(--radix-accordion-content-height)",
            },
            to: {
              height: "0",
            },
          },
          "fade-in": {
            "0%": {
              opacity: "0",
              transform: "translateY(20px)",
            },
            "100%": {
              opacity: "1",
              transform: "translateY(0)",
            },
          },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          "fade-in": "fade-in 0.6s ease-out",
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  } satisfies Config;
