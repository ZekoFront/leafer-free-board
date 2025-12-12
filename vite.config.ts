import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath, URL } from 'node:url'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        svgLoader({
            defaultImport: 'component',
        }),
        // 自动按需引入组件
        AutoImport({
            imports: [
                'vue', 
                'vue-router', 
                'pinia', 
                '@vueuse/core',
            ],
            dts: fileURLToPath(new URL('./auto-import.d.ts', import.meta.url)),
            eslintrc: {
                enabled: true,
                // 生成文件地址和名称
                filepath: fileURLToPath(
                    new URL('./.eslintrc-auto-import.json', import.meta.url)
                ),
                globalsPropValue: true
            },
            resolvers: [ElementPlusResolver()]
        }),
        Components({
            resolvers: [ElementPlusResolver()]
        })
    ],
    base: '/leafer-free-board/',
    build: {
        outDir: 'dist'
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
})
