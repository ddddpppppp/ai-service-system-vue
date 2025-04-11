import type { PluginOption } from 'vite'
import path from 'node:path'
import process from 'node:process'
import vueI18n from '@intlify/unplugin-vue-i18n/vite'
import vueLegacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import boxen from 'boxen'
import picocolors from 'picocolors'
import Unocss from 'unocss/vite'
import autoImport from 'unplugin-auto-import/vite'
import TurboConsole from 'unplugin-turbo-console/vite'
import components from 'unplugin-vue-components/vite'
import { loadEnv } from 'vite'
import AppLoading from 'vite-plugin-app-loading'
import Archiver from 'vite-plugin-archiver'
import banner from 'vite-plugin-banner'
import { compression } from 'vite-plugin-compression2'
import electron from 'vite-plugin-electron/simple'
import { envParse, parseLoadedEnv } from 'vite-plugin-env-parse'
import { vitePluginFakeServer } from 'vite-plugin-fake-server'
import Pages from 'vite-plugin-pages'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import VueDevTools from 'vite-plugin-vue-devtools'
import Layouts from 'vite-plugin-vue-meta-layouts'
import pkg from '../package.json'

export default function createVitePlugins(mode: string, isBuild = false) {
  const viteEnv = parseLoadedEnv(loadEnv(mode, process.cwd()))
  const isServe = mode === 'serve'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG
  const vitePlugins: (PluginOption | PluginOption[])[] = [
    vue(),
    vueJsx(),
    vueLegacy({
      renderLegacyChunks: false,
      modernPolyfills: [
        'es.array.at',
        'es.array.find-last',
        'es.object.has-own',
      ],
    }),

    // https://github.com/vuejs/devtools
    viteEnv.VITE_OPEN_DEVTOOLS && VueDevTools({
      launchEditor: viteEnv.VITE_VUE_DEVTOOLS_LAUNCH_EDITOR ?? 'vscode',
    }),

    envParse({
      dtsPath: 'src/types/env.d.ts',
    }),

    // https://github.com/unplugin/unplugin-auto-import
    autoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
      ],
      dts: './src/types/auto-imports.d.ts',
      dirs: [
        './src/utils/composables/**',
      ],
    }),

    // https://github.com/unplugin/unplugin-vue-components
    components({
      globs: [
        'src/ui/components/*/index.vue',
        'src/components/*/index.vue',
      ],
      dts: './src/types/components.d.ts',
    }),

    Unocss(),

    // https://github.com/vbenjs/vite-plugin-svg-icons
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons/')],
      symbolId: 'icon-[dir]-[name]',
      svgoOptions: isBuild,
    }),

    // https://github.com/condorheroblog/vite-plugin-fake-server
    vitePluginFakeServer({
      logger: !isBuild,
      include: 'src/mock',
      infixName: false,
      enableProd: isBuild && viteEnv.VITE_BUILD_MOCK,
    }),

    // https://github.com/intlify/vue-i18n
    vueI18n({
      include: path.resolve(process.cwd(), 'src/locales/lang/**'),
    }),

    // https://github.com/dishait/vite-plugin-vue-meta-layouts
    Layouts({
      defaultLayout: 'index',
    }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      dirs: 'src/views',
      exclude: [
        '**/components/**/*.vue',
      ],
    }),

    // https://github.com/nonzzz/vite-plugin-compression
    viteEnv.VITE_BUILD_COMPRESS?.split(',').includes('gzip') && compression(),
    viteEnv.VITE_BUILD_COMPRESS?.split(',').includes('brotli') && compression({
      exclude: [/\.(br)$/, /\.(gz)$/],
      algorithm: 'brotliCompress',
    }),

    viteEnv.VITE_BUILD_ARCHIVE && Archiver({
      archiveType: viteEnv.VITE_BUILD_ARCHIVE,
    }),

    AppLoading('loading.html'),

    // https://github.com/unplugin/unplugin-turbo-console
    TurboConsole(),

    // https://github.com/chengpeiquan/vite-plugin-banner
    banner(`
/**
 * 由 Fantastic-admin 提供技术支持
 * Powered by Fantastic-admin
 * https://fantastic-admin.hurui.me
 */
    `),

    {
      name: 'vite-plugin-debug-plugin',
      enforce: 'pre',
      transform: (code, id) => {
        if (/src\/main.ts$/.test(id)) {
          if (viteEnv.VITE_APP_DEBUG_TOOL === 'eruda') {
            code = code.concat(`
              import eruda from 'eruda'
              eruda.init()
            `)
          }
          else if (viteEnv.VITE_APP_DEBUG_TOOL === 'vconsole') {
            code = code.concat(`
              import VConsole from 'vconsole'
              new VConsole()
            `)
          }
          return {
            code,
            map: null,
          }
        }
      },
    },

    {
      name: 'vite-plugin-disable-devtool',
      enforce: 'pre',
      transform: (code, id) => {
        if (/src\/main.ts$/.test(id)) {
          if (viteEnv.VITE_APP_DISABLE_DEVTOOL) {
            code = code.concat(`
              import DisableDevtool from 'disable-devtool'
              DisableDevtool()
            `)
          }
          return {
            code,
            map: null,
          }
        }
      },
    },

    {
      name: 'vite-plugin-terminal-info',
      apply: 'serve',
      async buildStart() {
        const { bold, green, magenta, bgGreen, underline } = picocolors

        console.log(
          boxen(
            `${bold(green(`由 ${bgGreen('Fantastic-admin')} 驱动`))}\n\n${underline('https://fantastic-admin.hurui.me')}\n\n当前使用：${magenta('专业版')}`,
            {
              padding: 1,
              margin: 1,
              borderStyle: 'double',
              textAlignment: 'center',
            },
          ),
        )
      },
    },

    electron({
      main: {
        // Shortcut of `build.lib.entry`
        entry: 'electron/main/index.ts',
        onstart({ startup }) {
          if (process.env.VSCODE_DEBUG) {
            console.log(/* For `.vscode/.debug.script.mjs` */'[startup] Electron App')
          }
          else {
            startup()
          }
        },
        vite: {
          build: {
            sourcemap,
            minify: isBuild,
            outDir: 'dist-electron/main',
            rollupOptions: {
              // Some third-party Node.js libraries may not be built correctly by Vite, especially `C/C++` addons,
              // we can use `external` to exclude them to ensure they work correctly.
              // Others need to put them in `dependencies` to ensure they are collected into `app.asar` after the app is built.
              // Of course, this is not absolute, just this way is relatively simple. :)
              external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
            },
          },
        },
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: 'electron/preload/index.ts',
        vite: {
          build: {
            sourcemap: sourcemap ? 'inline' : undefined, // #332
            minify: isBuild,
            outDir: 'dist-electron/preload',
            rollupOptions: {
              external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
            },
          },
        },
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      // renderer: {},
    }),
  ]
  return vitePlugins
}
