import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript2 from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  // Stuff loaded from cdnjs.
  external: ['jquery', 'xterm', 'css-element-queries', 'fontfaceobserver'],
  input: 'source/Web/Scripts/index.ts',
  output: [
    {
      file: 'source/Web/Scripts/index.js',
      format: 'iife',
      name: 'window',
      extend: true,
      globals: {
        xterm: 'window',
        'css-element-queries': 'window',
        fontfaceobserver: 'FontFaceObserver',
      },
    },
    {
      file: 'source/Web/Scripts/index.min.js',
      format: 'iife',
      sourcemap: true,
      name: 'window',
      extend: true,
      globals: {
        xterm: 'window',
        'css-element-queries': 'window',
        fontfaceobserver: 'FontFaceObserver',
      },
    },
  ],
  plugins: [
    resolve({ browser: true }),
    commonjs({
      namedExports: {
        // Needed for xterm compatibility with rollup.
        xterm: ['Terminal'],
      },
    }),
    typescript2(),
    terser({ include: [/^.+\.min\.js$/] }),
  ],
};
