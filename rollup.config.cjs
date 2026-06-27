const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');
const dts = require('rollup-plugin-dts');

const pkg = require('./package.json');

const banner = `/**
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * 
 * @author ${pkg.author}
 * @license ${pkg.license}
 * @homepage ${pkg.homepage}
 */`;

module.exports = [
    // Build ESM
    {
        input: 'src/index.js',
        output: {
            file: 'dist/cryptologin-client.esm.js',
            format: 'esm',
            banner,
            sourcemap: true
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**'
            })
        ],
        external: []
    },
    // Build UMD
    {
        input: 'src/index.js',
        output: {
            file: 'dist/cryptologin-client.js',
            format: 'umd',
            name: 'CryptoLoginClient',
            banner,
            sourcemap: true
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**'
            })
        ]
    },
    // Build UMD minifiée
    {
        input: 'src/index.js',
        output: {
            file: 'dist/cryptologin-client.min.js',
            format: 'umd',
            name: 'CryptoLoginClient',
            banner,
            sourcemap: true
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**'
            }),
            terser({
                compress: {
                    drop_console: true,
                    drop_debugger: true
                }
            })
        ]
    },
    // Types TypeScript
    {
        input: 'src/types/index.d.ts',
        output: {
            file: 'dist/index.d.ts',
            format: 'es'
        },
        plugins: [dts.default()]
    }
];