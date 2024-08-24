import { defineConfig } from 'vite';
import unocss from 'unocss/vite';
import { presetWind } from 'unocss';

export default defineConfig({
  build: {
    emptyOutDir: true,
    minify: false,
  },
  plugins: [
    unocss({
      presets: [
        presetWind({
          prefix: 'tw-',
        }),
      ],
    }),
  ],
});
