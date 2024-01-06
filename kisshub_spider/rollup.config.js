import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';

import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import cleaner from 'rollup-plugin-cleaner';
import frameConfig from './frameconfig.js';
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';

export default {
    plugins: [
        replace({
            preventAssignment: true,
            values: {
                'process.env.FRAME_WORK': `'${process.env.FRAME_WORK}'`,
                'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
            },
        }),
        resolve({
            extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx']
        }),
        commonjs(),
        alias({
            entries: [...frameConfig.rollupAlias],
        }),
        babel({ babelHelpers: 'bundled', extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'] }),
        // cleaner({
        //     targets: ['./dist/'],
        // }),
    ],
};
