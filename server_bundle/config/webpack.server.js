/**
 * 打包用作服务端渲染
 */
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    app: path.join(__dirname, '../../src/server-entry.js')
  },
  output: {
    filename: 'server-entry.js',
    path: path.join(__dirname, '../dist'),
    publicPath: '/',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.js','.jsx']  // 可省略的后缀名
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
              ]
            },
          }
        ],
        exclude: [path.join(__dirname, '../../node_modules/'), path.join(__dirname, '../node_modules/')]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: path.join(__dirname, '../dist')
            }
          },
          'css-loader',
        ]
      },
      {
        test: /\.scss$/,
        // 分离 sass => css 到单独文件
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.(jpg|png|gif|ico)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "image/[name]-[hash:8].[ext]"
            }
          },
        ]
      },
    ]
  },
  plugins: [
    // 分离 sass => css 到单独文件
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].chunk.[hash].css'
    }),
  ]
}
