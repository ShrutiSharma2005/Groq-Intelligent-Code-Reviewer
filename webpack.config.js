const path = require('path');

module.exports = {
  mode: 'none',
  target: 'node',
  entry: {
    extension: './extension/src/extension.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs'
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.js'],
    fallback: {
      "path": require.resolve("path-browserify")
    }
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            "module": "es6" // override tsconfig.json just for webpack
          }
        }
      }]
    }]
  },
  externals: {
    vscode: 'commonjs vscode' 
  },
  devtool: 'nosources-source-map',
};
