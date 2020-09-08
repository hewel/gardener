import svelte from 'rollup-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
import { pipe, pair, fromPairs, map, keys } from 'ramda'
import { icons } from 'feather-icons'
import CFonts from 'cfonts'
import pkg from './package.json'

const production = !process.env.ROLLUP_WATCH

const banner = `
// ==UserScript==
// @name ${pkg.name}
// @description ${pkg.description}
// @author ${pkg.author.name}
// @include *://share.dmhy.org/*
// @version ${pkg.version}
// ==/UserScript==
`

const terserOpts = () => {
  const keywords = [
    '@name',
    '@namespace',
    '@version',
    '@author',
    '@description',
    '@homepage',
    '@homepageURL',
    '@website',
    '@source',
    '@icon',
    '@iconURL',
    '@defaulticon',
    '@icon64',
    '@icon64URL',
    '@updateURL',
    '@downloadURL',
    '@supportURL',
    '@include',
    '@match',
    '@exclude',
    '@require',
    '@resource',
    '@connect',
    '@run-at',
    '@grant',
    '@noframes',
    '@unwrap',
    '@nocompat',
    'UserScript',
  ]
  return {
    output: {
      comments: (_node, { type, value }) =>
        type === 'comment1' && new RegExp(keywords.join('|'), 'i').test(value),
    },
  }
}

const replaceOpts = () => {
  const iconToPair = (key) => pair(`icon__${key}`, icons[key].toSvg())
  return pipe(keys, map(iconToPair), fromPairs)(icons)
}

const postcssPlugins = [
  require('tailwindcss'),
  production && require('autoprefixer'),
  require('postcss-csso'),
].filter((p) => p)
const logoAscii = (text) =>
  CFonts.render(text, { font: 'block', maxLength: Math.round(text.length / 2) })
    .string

export default {
  input: 'src/main.ts',
  output: {
    format: 'iife',
    name: 'app',
    sourcemap: !production,
    file: production ? 'public/BiliArmor.js' : 'public/dist/bundle.js',
    banner: () => {
      return production ? banner : ''
    },
    // intro: () => {
    //   const process = {
    //     env: {
    //       NODE_ENV: production ? 'production' : 'development',
    //     },
    //   }
    //   return `const process = ${JSON.stringify(process)}`
    // },
  },
  plugins: [
    replace({
      ...replaceOpts(),
      'process.env.NODE_ENV': JSON.stringify(
        production ? 'production' : 'development'
      ),
      __BANNER__: production ? logoAscii('BiliArmor suit up!') : 'LOGO',
    }),
    typescript({
      sourceMap: !production,
    }),
    svelte({
      preprocess: sveltePreprocess({
        sourceMap: !production,
      }),
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file - better for performance
      // css: (css) => {
      //   css.write('public/dist/bundle.css');
      // },
      emitCss: true,
    }),
    postcss({
      sourcemap: !production,
      plugins: postcssPlugins,
    }),
    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    babel({ babelHelpers: 'bundled' }),
    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production &&
      livereload({
        watch: 'public',
        clientUrl: 'http://localhost:35729/livereload.js?snipver=1',
      }),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(terserOpts()),
  ],
  watch: {
    clearScreen: false,
  },
}

function serve() {
  let started = false

  return {
    writeBundle() {
      if (!started) {
        started = true

        require('child_process').spawn('serve', ['public'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        })
      }
    },
  }
}
