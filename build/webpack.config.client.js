const path=require('path');
const webpack=require('webpack');
const webpackMerge = require('webpack-merge');
const baseConfig = require('./webpack.base');
const HTMLPlugin=require('html-webpack-plugin');
const CleanWebpackPlugin=require('clean-webpack-plugin')
const NameAllModulesPlugin = require('name-all-modules-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const cdnConfig = require('../app.config').cdn

const isDev = process.env.NODE_ENV === 'development'

const config=webpackMerge(baseConfig,{
    mode:isDev?'development':'production',
    entry:{
        app:path.join(__dirname,'../client/app.js')
    },
    output:{
        filename:'[name].[hash].js',
    },
    plugins:[
        new CleanWebpackPlugin(['dist'],{
            root: path.resolve(__dirname, '../'),
        }),
        new HTMLPlugin({
            template:path.join(__dirname,'../client/template.html')
        }),
        new HTMLPlugin({
            template:'!!ejs-compiled-loader!'+path.join(__dirname,'../client/server.template.ejs'),
            filename: 'server.ejs'
        })
    ]
})
if (isDev) {
  config.devtool = '#cheap-module-eval-source-map'
  config.entry = {
    app: [
      'react-hot-loader/patch',
      path.join(__dirname, '../client/app.js')
    ]
  }
  config.devServer = {
    host: '0.0.0.0',
    compress: true,
    port: '8888',
    //contentBase: path.join(__dirname, '../dist'),
    hot: true,
    overlay: {
      errors: true
    },
    publicPath: '/public/',
    historyApiFallback: {
      index: '/public/index.html'
    },
    proxy: {
      '/api': 'http://localhost:3333'
    }
  }
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
} else {
  config.entry = {
    app: path.join(__dirname, '../client/app.js'),
    vendor: [
      'react',
      'react-dom',
      'react-router-dom',
      'mobx',
      'mobx-react',
      'axios',
      'query-string',
      'dateformat',
      'marked'
    ]
  }
  config.output.filename = '[name].[chunkhash].js'
  config.output.publicPath = cdnConfig.remoteUrl+cdnConfig.remoteFileName
  config.optimization = {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: false
        }
      })
    ],
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 5,
          minSize: 0,
          priority: 10,
          enforce: true
        }
      }
    }
  }
  config.plugins.push(
    new webpack.NamedModulesPlugin(),
    new NameAllModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.NamedModulesPlugin((chunk) => {
      if (chunk.name) {
        return chunk.name
      }
      return chunk.mapModules(m => path.relative(m.context, m.request)).join('_')
    })
  )
}

module.exports = config
