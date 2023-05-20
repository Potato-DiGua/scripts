const config = {
    domchef: {
        reactBabelConfig: {
            //   pragma: "h", // default pragma is React.createElement (only in classic runtime)
            //   pragmaFrag: 'DocumentFragment',
        },
        rollupAlias: [
            // react引入替换为dom-chef
            { find: 'react', replacement: 'dom-chef' },
        ],
    },
    preact: {
        reactBabelConfig: {
            pragma: 'h',
            pragmaFrag: 'Fragment',
        },
        rollupAlias: [
            // react引入替换为preact
            { find: 'react', replacement: 'preact/compat' },
            { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
            { find: 'react-dom', replacement: 'preact/compat' },
            { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' },
        ],
    },
};

const supportFrames = Object.keys(config);
const frameWork = process.env.FRAME_WORK?.trim()?.toLowerCase();
if (!supportFrames.includes(frameWork)) {
    throw new Error(`not support ${frameWork},frameWork only support ${supportFrames.join(', ')}`);
}

export default config[frameWork];
