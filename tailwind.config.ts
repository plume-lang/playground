import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Noto Sans", ...fontFamily.sans],
        mono: ["Fira Code", ...fontFamily.mono],
      },
      colors: {
        'hot-pink': { DEFAULT: '#FF66C4', 50: '#FFF5FB', 100: '#FFE0F3', 200: '#FFB8E3', 300: '#FF8FD4', 400: '#FF66C4', 500: '#FF2EAE', 600: '#F50096', 700: '#BD0074', 800: '#850051', 900: '#4D002F', 950: '#30001E' },
        
        'mustard': {  DEFAULT: '#FFDE59',  50: '#FFFAE8',  100: '#FFF6D3',  200: '#FFEEAB',  300: '#FFE682',  400: '#FFDE59',  500: '#FFD321',  600: '#E8BA00',  700: '#B08D00',  800: '#786000',  900: '#403300',  950: '#231C00'},
      }
    },
  },
  plugins: [],
};
export default config;
