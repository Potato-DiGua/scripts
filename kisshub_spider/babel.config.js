import frameConfig from './frameconfig.js';

export default {
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'usage',
                corejs: '3.30',
            },
        ],
        ['@babel/preset-react', frameConfig.reactBabelConfig],
        '@babel/preset-typescript',
    ],
};
