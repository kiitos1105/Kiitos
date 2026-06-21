import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  safelist: [
    "from-amber-200/35",
    "from-emerald-200/28",
    "from-slate-200/24",
    "from-cyan-200/28",
    "from-indigo-200/30",
    "bg-[#b8834d]",
    "bg-[#6f7b55]",
    "bg-[#7e8b94]",
    "bg-[#4e91a3]",
    "bg-[#6867a6]",
    "text-amber-100",
    "text-emerald-100",
    "text-slate-100",
    "text-cyan-100",
    "text-indigo-100"
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
