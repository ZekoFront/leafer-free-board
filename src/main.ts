import "./style.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();

app.config.errorHandler = (err, _instance, info) => {
    console.error(`[Global Error] ${info}:`, err);
};

app.use(pinia);
app.mount("#app");
