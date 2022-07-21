// rollup 天然支持esm
import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";
export default {
  input: "./src/index.ts",
  output: [
    // 1 cjs commonjs
    // 2 esm es模块规范
    {
      format: "cjs",
      file: pkg.main,
    },
    {
      format: "es",
      file: pkg.module,
    },
  ],

  plugins: [typescript()],
};
