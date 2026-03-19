import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { fileURLToPath, URL } from "node:url";
import svgLoader from "vite-svg-loader";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        svgLoader({
            defaultImport: "component",
        }),
        // 自动按需引入组件
        AutoImport({
            imports: [
                "vue",
                "vue-router",
                "pinia",
                "@vueuse/core",
                {
                    "naive-ui": [
                        "useDialog",
                        "useMessage",
                        "useNotification",
                        "useLoadingBar",
                    ],
                },
            ],
            dts: fileURLToPath(new URL("./auto-import.d.ts", import.meta.url)),
            eslintrc: {
                enabled: true,
                // 生成文件地址和名称
                filepath: fileURLToPath(
                    new URL("./.eslintrc-auto-import.json", import.meta.url),
                ),
                globalsPropValue: true,
            },
        }),
        Components({
            resolvers: [NaiveUiResolver()],
        }),
    ],
    base: "/leafer-free-board/",
    build: {
        outDir: "dist",
        chunkSizeWarningLimit: 500,
        rolldownOptions: {
            output: {
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'js/[name]-[hash].js',
                codeSplitting: {
                    // 设置 chunk 的最大体积，Rolldown 会尽量把超出的块自动拆分 (单位: 字节)
                    maxSize: 500 * 1024,
                    groups: [
                        // 提取 Leafer 绘图引擎相关 (最高优先级，因为最重)
                        {
                            name: 'leafer-vendor',
                            test: /[\\/]node_modules[\\/](@leafer.*|leafer.*)[\\/]/,
                            priority: 40
                        },
                        {
                            name: 'naive-vendor',
                            test: /[\\/]node_modules[\\/]naive-ui[\\/]/,
                            priority: 30
                        },
                        {
                            name: 'vue-vendor',
                            test: /[\\/]node_modules[\\/](vue|pinia|@vueuse.*)[\\/]/,
                            priority: 20
                        },
                        {
                            name: 'utils-vendor',
                            test: /[\\/]node_modules[\\/](lodash-es|decimal\.js|lz-string|hotkeys-js|uuid)[\\/]/,
                            priority: 10
                        }
                    ]
                }
            }
        }
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
