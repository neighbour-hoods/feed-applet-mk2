import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return isProduction ? {
    // plugins: [
    //   {
    //     name: 'copy-assets',
    //     apply: 'build',
    //     generateBundle() {
    //       this.emitFile({
    //         type: 'asset',
    //         fileName: 'icon.png',
    //         source: require('fs').readFileSync('icon.png'),
    //       });
    //     },
    //   },
    // ],
    build: {
      sourcemap: true,
      lib: {
        entry: 'src/applet-index.ts',
        name: 'applet',
        fileName: (_format) => `index.js`,
        formats: ['es'],
      }
    },
  } : {}
})