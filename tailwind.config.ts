import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          950: "rgb(10, 17, 20)",
          900: "rgb(18, 24, 24)",
          wood: "rgb(104, 67, 38)",
          lamp: "rgb(255, 203, 128)"
        },
        obs: {
          bg: "rgb(10, 17, 20)",
          panel: "rgba(255, 255, 255, 0.08)",
          line: "rgba(255, 255, 255, 0.16)"
        }
      },
      boxShadow: {
        glass: "0 28px 80px rgba(0, 0, 0, 0.42)"
      }
    }
  },
  plugins: []
};

export default config;
