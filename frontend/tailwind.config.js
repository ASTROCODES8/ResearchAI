/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      /* ── Brand colour palette ── */
      colors: {
        brand: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
      },

      /* ── Typography ── */
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      lineHeight: {
        prose: "1.75",
        snug:  "1.375",
        tight: "1.25",
      },
      letterSpacing: {
        tightest: "-0.03em",
        tighter:  "-0.02em",
        tight:    "-0.015em",
      },

      /* ── Spacing ── */
      spacing: {
        "4.5": "1.125rem",
        "13":  "3.25rem",
        "15":  "3.75rem",
        "18":  "4.5rem",
      },

      /* ── Border radius ── */
      borderRadius: {
        "2xl":  "1rem",
        "3xl":  "1.25rem",
        "4xl":  "1.5rem",
        "5xl":  "2rem",
      },

      /* ── Shadows ── */
      boxShadow: {
        "xs":          "0 1px 2px rgba(0,0,0,0.04)",
        "sm":          "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "md":          "0 4px 8px -2px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
        "lg":          "0 10px 24px -4px rgba(0,0,0,0.09), 0 4px 8px rgba(0,0,0,0.04)",
        "xl":          "0 20px 48px -8px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)",
        "glass":       "0 4px 24px -2px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        "sidebar":     "4px 0 24px rgba(0,0,0,0.04)",
        "card-hover":  "0 8px 24px -4px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
        "popover":     "0 16px 48px -4px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
        "brand-sm":    "0 2px 8px rgba(2, 132, 199, 0.2)",
        "brand-md":    "0 4px 16px rgba(2, 132, 199, 0.25)",
        "brand-lg":    "0 8px 32px rgba(2, 132, 199, 0.3)",
      },

      /* ── Transition timing ── */
      transitionTimingFunction: {
        "spring":  "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "smooth":  "cubic-bezier(0.4, 0, 0.2, 1)",
        "snap":    "cubic-bezier(0.23, 1, 0.32, 1)",
        "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },

      /* ── Transition duration ── */
      transitionDuration: {
        "50":  "50ms",
        "250": "250ms",
        "400": "400ms",
      },

      /* ── Backdrop blur ── */
      backdropBlur: {
        "xs": "2px",
        "sm": "4px",
        "md": "8px",
        "lg": "16px",
        "xl": "24px",
      },

      /* ── Background blur ── */
      blur: {
        "2xs": "1px",
        "xs":  "2px",
      },

      /* ── Animations (Tailwind shorthand) ── */
      animation: {
        "fade-in":       "fade-in 0.22s ease-out both",
        "slide-up":      "slide-up 0.28s ease-out both",
        "slide-in":      "slide-in-right 0.22s ease-out both",
        "slide-in-left": "slide-in-left 0.22s ease-out both",
        "scale-in":      "scale-in 0.18s ease-out both",
        "float":         "float 3s ease-in-out infinite",
        "spin-slow":     "spin-slow 8s linear infinite",
        "pulse-glow":    "pulse-glow 2.5s ease-in-out infinite",
        "shimmer":       "shimmer 1.6s ease-in-out infinite",
      },

      /* ── Keyframes ── */
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px) scale(0.98)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)"      },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to:   { opacity: "1", transform: "translateY(0)"     },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to:   { opacity: "1", transform: "translateX(0)"     },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(10px)" },
          to:   { opacity: "1", transform: "translateX(0)"    },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to:   { opacity: "1", transform: "scale(1)"    },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)"    },
          "50%":      { transform: "translateY(-6px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)"   },
          to:   { transform: "rotate(360deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(14,165,233,0.3)"  },
          "50%":      { boxShadow: "0 0 0 8px rgba(14,165,233,0)"  },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
      },

      /* ── Z-index scale ── */
      zIndex: {
        "60":  "60",
        "70":  "70",
        "80":  "80",
        "90":  "90",
        "100": "100",
      },
    },
  },
  plugins: [],
};
