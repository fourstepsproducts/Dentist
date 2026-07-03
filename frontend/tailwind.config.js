/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        border: "#E2E8F0",
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#14B8A6",
          foreground: "#FFFFFF",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        textPrimary: "#0F172A",
        textSecondary: "#64748B",
        // Keeping legacy vars for backward compatibility in shadcn if needed
        ring: "#2563EB",
        muted: "#F1F5F9",
        card: "#FFFFFF",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
    },
  },
  plugins: [],
}
