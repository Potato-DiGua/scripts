import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';

export default {
    input: 'src/main.tsx',
    output: [
        {
            file: 'dist/bundle.js',
            format: 'iife',
        },
        {
            file: 'dist/bundle.min.js',
            format: 'iife',
            plugins: [terser()],
        },
    ],
    plugins: [
        alias({
            entries: [
                // react引入替换为dom-chef
                // { find: 'react', replacement: 'dom-chef' }
            ],
        }),
        resolve(),
        commonjs(),
        typescript(),
        babel({ babelHelpers: 'bundled' }),
    ],
};
