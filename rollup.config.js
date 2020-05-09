import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'source/Web/Scripts/app/index.ts',
  output: {
    dir: 'source/Web/Scripts/app/',
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

// TODO
// How to include signalr lib and signalr generated server.js?
// The latter probably only using the bundle. Is it then loaded in the correct order?
// How can TypeScript errors in VS Code be prevented with the current tsconfig.json?
