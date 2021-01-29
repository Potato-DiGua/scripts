import resolve from "@rollup/plugin-node-resolve";
import common from "@rollup/plugin-commonjs";
// import json from "@rollup/plugin-json";
import typescriptRollup from "@rollup/plugin-typescript";


export default {
  input: "src/index.ts",
  output: {
    file: "./dist/bundle.js",
    format: "cjs",
  },
  plugins: [
    resolve(),
    common(/* { include: "./node_modules" } */),
    // json(),
    typescriptRollup(),
  ],
};
