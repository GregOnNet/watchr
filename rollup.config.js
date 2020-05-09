import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import typescript2 from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  external: ['jquery'],
  input: 'source/Web/Scripts/index.ts',
  output: [
    {
      file: 'source/Web/Scripts/index.js',
      format: 'iife',
      name: 'window',
      extend: true,
    },
    {
      file: 'source/Web/Scripts/index.min.js',
      format: 'iife',
      sourcemap: true,
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
