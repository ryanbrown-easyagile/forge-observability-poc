module.exports = {
  plugins: [
    '@atlaskit/tokens/babel-plugin',
    // ↓↓ Compiled should run last ↓↓
    [
      '@compiled/babel-plugin',
      { transformerBabelPlugins: ['@atlaskit/tokens/babel-plugin'] },
    ],
    // OPTIONAL: If you are distributing packages with Compiled styles, you should remove the runtime:
    [
      '@compiled/babel-plugin-strip-runtime',
      {
        sortShorthand: true,
        // Your `extractStylesToDirectory` config may vary
        extractStylesToDirectory: { source: 'src', dest: 'dist' },
      },
    ],
  ],
};
