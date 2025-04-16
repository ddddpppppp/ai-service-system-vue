import antfu from '@antfu/eslint-config'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'
import prettierPlugin from 'eslint-plugin-prettier'

export default antfu(
  {
    unocss: true,
    ignores: [
      'public',
      'dist*',
      'src/ui/shadcn/ui',
    ],
  },
  {
    // 新增 Prettier 集成和保存自动修复配置
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'no-console': 'off',
      'vue/html-comment-content-spacing': 'off',
      'vue/html-indent': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
      'curly': ['error', 'all'],
      'ts/no-unused-expressions': ['error', {
        allowShortCircuit: true,
        allowTernary: true,
      }],
    },
  },
  {
    files: [
      'src/**/*.vue',
    ],
    rules: {
      'vue/block-order': ['error', {
        order: ['route', 'i18n', 'script', 'template', 'style'],
      }],
    },
  },
  ...vueI18n.configs['flat/recommended'],
  {
    rules: {
      '@intlify/vue-i18n/no-raw-text': 'off',
    },
    settings: {
      'vue-i18n': {
        localeDir: './src/locales/lang/*.{json,json5,yaml,yml}',
        messageSyntaxVersion: '^10.0.0',
      },
    },
  },
)
