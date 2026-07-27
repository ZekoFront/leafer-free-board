import { defineConfig, type UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { fileURLToPath, URL } from "node:url";
import svgLoader from "vite-svg-loader";

const alias = {
    "@": path.resolve(__dirname, "./src"),
};

const libExternal = [
    "vue",
    "pinia",
    "leafer-ui",
    /^@leafer-in\//,
    /^@leafer-ui\//,
    /^@leafer\//,
    /^leafer-x-/,
    "events",
    "hotkeys-js",
    "uuid",
    "lodash-es",
    "decimal.js",
    "lz-string",
    "@vueuse/core",
];

/** npm 库模式：输出 dist/index.js + dist/index.d.ts */
const libConfig: UserConfig = {
    plugins: [
        vue(),
        svgLoader({ defaultImport: "component" }),
        dts({
            tsconfigPath: "./tsconfig.build.json",
            entryRoot: "src",
            include: ["src/**/*.ts", "src/**/*.vue"],
            exclude: ["src/playground/**"],
        }),
    ],
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rolldownOptions: {
            checks: {
                // 库构建总时长 ~6s，dts/svg 占比高属正常，关闭误报式提示
                pluginTimings: false,
            },
            external: libExternal,
            output: {
                entryFileNames: "[name].js",
                assetFileNames: "assets/[name][extname]",
            },
        },
        lib: {
            entry: {
                index: path.resolve(__dirname, "src/index.ts"),
                "plugins/index": path.resolve(__dirname, "src/plugins/index.ts"),
            },
            formats: ["es"],
        },
    },
    resolve: { alias },
};

/** Playground 演示站构建 */
const appConfig: UserConfig = {
    plugins: [
        vue(),
        svgLoader({ defaultImport: "component" }),
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
        chunkSizeWarningLimit: 1024,
        rolldownOptions: {
            output: {
                assetFileNames: "assets/[name]-[hash][extname]",
                chunkFileNames: "js/[name]-[hash].js",
                codeSplitting: {
                    groups: [
                        {
                            name: "leafer-vendor",
                            test: /[\\/]node_modules[\\/](@leafer|leafer|@leafer-in|@leafer-ui)[\\/]/,
                            priority: 40,
                        },
                    ],
                },
            },
        },
    },
    resolve: { alias },
};

// https://vite.dev/config/
export default defineConfig(({ mode }) =>
    mode === "lib" ? libConfig : appConfig,
);
