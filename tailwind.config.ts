import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#5166e6",
          dark: "#0A0F1E",
        },
        // Sobrescreve a paleta "orange" do Tailwind para tons da brand-blue
        // — assim as classes orange-300/400/500 existentes renderizam azul
        // sem precisar reescrever todos os componentes.
        orange: {
          300: "#98A2EE",
          400: "#7884E9",
          500: "#5166e6",
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
