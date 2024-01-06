import gulp from 'gulp';
import { rollup } from 'rollup';
import rollupConfig from './rollup.config.js';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';

 async function buildMain () {
    const bundle = await rollup({
        ...rollupConfig,
        input: './src/main.tsx',
        plugins: [
            ...rollupConfig.plugins,
            postcss({
            }),
        ]
    });

    await bundle.write({
        file: 'dist/main.js',
        format: 'iife',
    });
    await bundle.write({
        file: 'dist/main.min.js',
        format: 'iife',
        plugins: [terser()],
    })
}

async function buildMainLit() {
    const bundle = await rollup({
        ...rollupConfig,
        input: './src/main-lit.ts',
        plugins: [
            ...rollupConfig.plugins,
            postcss({inject: false, autoModules: false}),
        ],
    });

    await bundle.write({
        file: 'dist/main-lit.js',
        format: 'iife',
    });
    await bundle.write({
        file: 'dist/main-lit.min.js',
        format: 'iife',
        plugins: [terser()],
    })
}

export const build = gulp.series(buildMain, buildMainLit)
