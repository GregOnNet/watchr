import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default {
  external: ['jquery'],
  input: 'source/Web/Scripts/index.ts',
  output: {
    dir: 'source/Web/Scripts/',
    format: 'umd',
  },
  plugins: [
    resolve({ browser: true }),
    commonjs({
      namedExports: {
        // Needed for xterm compatibility with rollup.
        xterm: ['Terminal'],
      },
    }),
    typescript(),
  ],
};
