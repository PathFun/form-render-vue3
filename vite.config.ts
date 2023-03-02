/// <reference types="vitest" />

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslint from 'vite-plugin-eslint';
import { resolve } from 'path';
import vueJsx from '@vitejs/plugin-vue-jsx';
import lessCopy from './plugins/less-copy.js';
import copy from 'rollup-plugin-copy';
import dts from 'vite-plugin-dts';
const { name } = require('./package.json');

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    eslint(),
    lessCopy(),
    copy({
      hook: 'writeBundle',
      targets: [{ src: 'src/form-render/widgets/antd/index.d.ts', dest: 'dist/form-render/widgets/antd/' }],
    }),
    dts({
      outputDir: 'dist',
      tsConfigFilePath: './tsconfig.json',
    }),
  ],
  build: {
    target: 'modules',
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/form-render/index.ts'),
      formats: ['es', 'cjs', 'umd'],
      name,
      fileName: format => `${name}.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'ant-design-vue', 'vue-types', '@ant-design/icons-vue'],
      output: {
        globals: {
          vue: 'Vue',
          'ant-design-vue': 'antd',
          'vue-types': 'vueTypes',
          '@ant-design/icons-vue': 'iconsVue',
        },
      },
    },
  },
  css: {
    postcss: {},
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
  test: {
    globals: true,
    clearMocks: true,
    environment: 'happy-dom',
    include: ['**/*/__tests__/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  server: {
    port: 8017,
  },
});
