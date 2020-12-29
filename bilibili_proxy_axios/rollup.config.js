import resolve from "@rollup/plugin-node-resolve";
import common from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.js",
  output: {
    file: "./build/bundle.js",
    format: "cjs",
  },
  plugins: [
    resolve(
    //   {
    //   moduleDirectories: ["node_modules"],
    // }
    ),
    common(),
    json(),
  ],
};
