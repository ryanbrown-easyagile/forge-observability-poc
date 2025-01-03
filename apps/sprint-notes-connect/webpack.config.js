const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/sprint-notes-connect'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      externalDependencies: 'none'
    }),
    new CopyPlugin({
      patterns: [
        { from: "atlassian-connect.json", to: "atlassian-connect.json" },
        { from: "config.json", to: "config.json" },
        { from: "src/views", to: "views" },
      ],
    }),
  ],
};
