import resolveTw from "tailwindcss/resolveConfig";
import config from '#root/tailwind.config';

export const tw = resolveTw(config).theme;