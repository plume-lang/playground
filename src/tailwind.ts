import resolveTw from "tailwindcss/resolveConfig";
import config from '../tailwind.config';

export const tw = resolveTw(config).theme;