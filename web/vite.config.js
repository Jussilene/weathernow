import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // permite abrir por IP da máquina (ex.: 192.168.x.x:5174)
    port: 5174,
  },
});
