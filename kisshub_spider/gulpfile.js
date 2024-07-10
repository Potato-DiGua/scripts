import gulp from 'gulp';
import { rollup } from 'rollup';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';

import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import cleaner from 'rollup-plugin-cleaner';
import frameConfig from './frameconfig.js';
import cssnano from 'cssnano';
import fs from 'fs';

const UserScript = fs.readFileSync('./UserScript.txt', { encoding: 'utf-8' });

function banner(options) {
  return {
    name: 'banner',
    renderChunk(code) {
      return options + code;
    },
  };
}

async function buildMain() {
  const bundle = await rollup({
    input: './src/main.tsx',
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          'process.env.FRAME_WORK': `'${process.env.FRAME_WORK}'`,
          'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
        },
      }),
      resolve({
        extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx'],
      }),
      commonjs(),
      alias({
        entries: [...frameConfig.rollupAlias],
      }),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'],
        presets: [
          //   [
          //     '@babel/preset-env',
          //     {
          //       useBuiltIns: 'usage',
          //       corejs: '3.30',
          //     },
          //   ],
          ['@babel/preset-react', frameConfig.reactBabelConfig],
          '@babel/preset-typescript',
        ],
      }),
      postcss({}),
    ],
  });

  await bundle.write({
    file: 'dist/main.js',
    format: 'iife',
    plugins: [banner(UserScript)],
  });
  await bundle.write({
    file: 'dist/main.min.js',
    format: 'iife',
    plugins: [terser(), banner(UserScript)],
  });
}

async function buildMainLit() {
  const bundle = await rollup({
    input: './src/main-lit.ts',
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          'process.env.FRAME_WORK': `'${process.env.FRAME_WORK}'`,
          'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
        },
      }),
      resolve({
        extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx'],
      }),
      commonjs(),
      alias({
        entries: [],
      }),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'],
        presets: [
          //   [
          //     '@babel/preset-env',
          //     {
          //       useBuiltIns: 'usage',
          //       corejs: '3.30',
          //     },
          //   ],
          '@babel/preset-typescript',
        ],
      }),
      postcss({ inject: false, autoModules: false }),
    ],
  });

  await bundle.write({
    file: 'dist/main-lit.js',
    format: 'iife',
    plugins: [banner(UserScript)],
  });
  await bundle.write({
    file: 'dist/main-lit.min.js',
    format: 'iife',
    plugins: [terser(), banner(UserScript)],
  });
}

async function buildMainSolid() {
  const bundle = await rollup({
    input: './src/main-solid.tsx',
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          'process.env.FRAME_WORK': `'${process.env.FRAME_WORK}'`,
          'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
        },
      }),
      resolve({
        extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx'],
      }),
      commonjs(),
      alias({
        entries: [],
      }),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'],
        presets: ['solid', '@babel/preset-typescript'],
      }),
      postcss({}),
    ],
  });

  await bundle.write({
    file: 'dist/main-solid.js',
    format: 'iife',
    plugins: [banner(UserScript)],
  });
  await bundle.write({
    file: 'dist/main-solid.min.js',
    format: 'iife',
    plugins: [terser(), banner(UserScript)],
  });
}

export const build = gulp.series(buildMain, buildMainLit, buildMainSolid);
