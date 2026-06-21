import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
