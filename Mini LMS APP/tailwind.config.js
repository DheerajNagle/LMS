/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: NativeWind v4 requires styling files in these directories to compile
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1", // Brand Accent / Indigo
          600: "#4F46E5",
          700: "#4338CA",
        },
        slate: {
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["System", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        "soft-dark": "0 4px 20px -2px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
