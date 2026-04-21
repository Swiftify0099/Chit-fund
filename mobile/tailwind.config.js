/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary:   "#6C63FF",
        secondary: "#FF6584",
        success:   "#27AE60",
        warning:   "#F39C12",
        danger:    "#E74C3C",
        dark:      "#0F1629",
        card:      "#1A2240",
        surface:   "#232E4A",
        muted:     "#8892B0",
        light:     "#CCD6F6",
      },
      fontFamily: {
        sans: ["Inter", "System"],
      },
    },
  },
  plugins: [],
};
