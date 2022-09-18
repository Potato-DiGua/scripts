import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

const babelOptions = require('./babel.config.js');
export default {
  input: 'src/main.tsx',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [resolve(),
  commonjs(),
  typescript(), 
  babel({ babelHelpers: 'bundled' })]
};