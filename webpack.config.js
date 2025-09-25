/**
 * @license Copyright (c) 2014-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const {bundler, styles} = require( '@ckeditor/ckeditor5-dev-utils' );
const {CKEditorTranslationsPlugin} = require( '@ckeditor/ckeditor5-dev-translations' );
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const getModuleFederationConfig = require('@jahia/webpack-config/getModuleFederationConfig');
const packageJson = require('./package.json');
require('dotenv').config({ path: './.env' });

console.log('Building with CKEditor license:', process.env.CKEDITOR_PRODUCTIVITY_LICENSE ? 'Available' : 'Not found');
module.exports = (env, argv) => {
    let _argv = argv || {};

    let config = {
        entry: {
            main: path.resolve(__dirname, 'src/javascript/index')
        },
        output: {
            path: path.resolve(__dirname, 'src/main/resources/javascript/apps/'),
            filename: 'ckeditor.bundle.js',
            chunkFilename: '[name].ckeditor.[chunkhash:6].js'
        },
        resolve: {
            mainFields: ['module', 'main'],
            extensions: ['.mjs', '.js', '.jsx', 'json', '.scss'],
            alias: {
                '~': path.resolve(__dirname, './src/javascript'),
                'debug': 'debug/src/browser.js'
            },
            fallback: {
                "os": false,
                "tty": false,
                "url": false
            }
        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    type: 'javascript/auto'
                },
                {
                    test: /\.jsx?$/,
                    include: [path.join(__dirname, 'src')],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    modules: false,
                                    targets: {chrome: '60', edge: '44', firefox: '54', safari: '12'}
                                }],
                                '@babel/preset-react'
                            ],
                            plugins: [
                                'lodash',
                                '@babel/plugin-syntax-dynamic-import'
                            ]
                        }
                    }
                },
                {
                    test: /\.scss$/i,
                    include: [path.join(__dirname, 'src')],
                    sideEffects: true,
                    use: [
                        'style-loader',
                        // Translates CSS into CommonJS
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    mode: 'local'
                                }
                            }
                        },
                        // Compiles Sass to CSS
                        'sass-loader'
                    ]
                },
                {
                    test: /\.svg$/,
                    use: [ 'raw-loader' ]
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: 'style-loader',
                            options: {
                                injectType: 'singletonStyleTag',
                                attributes: {
                                    'data-cke': true
                                }
                            }
                        },
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: styles.getPostCssConfig( {
                                    themeImporter: {
                                        themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
                                    },
                                    minify: true
                                } )
                            }
                        },
                    ]
                }
            ]
        },
        plugins: [
            new ModuleFederationPlugin(getModuleFederationConfig(packageJson, {
                exposes: {
                    '.': './src/javascript/shared',
                },
                remotes: {
                    '@jahia/jcontent': 'appShell.remotes.jcontent',
                },
            })),
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: [`${path.resolve(__dirname, 'src/main/resources/javascript/apps/')}/**/*`],
                verbose: false
            }),
            new CopyWebpackPlugin({
                patterns: [{
                    from: './package.json',
                    to: ''
                }]
            }),
            new CKEditorTranslationsPlugin( {
                // UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
                // When changing the built-in language, remember to also change it in the editor's configuration (src/ckeditor.js).
                language: 'en',
                additionalLanguages: 'all'
            } ),
            new webpack.BannerPlugin( {
                banner: bundler.getLicenseBanner(),
                raw: true
            }),
            new webpack.DefinePlugin({
                CKEDITOR_PRODUCTIVITY_LICENSE: JSON.stringify(process.env.CKEDITOR_PRODUCTIVITY_LICENSE)
            })
        ],
        mode: _argv.mode ?  _argv.mode : 'development',
    };

    config.devtool = (_argv.mode === 'production') ? 'source-map' : 'eval-source-map';

    if (_argv.analyze) {
        config.devtool = 'source-map';
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
};
