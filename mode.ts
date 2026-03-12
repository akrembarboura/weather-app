export const denoMode = {
  name: "Deno",
  tsconfig: {
    compilerOptions: {
      target: "ES2024",
      module: "ESNext",
      moduleResolution: "Bundler",
    },
  },
  extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  settings: {
    "deno.enable": true,
    "deno.lint": true,
    "editor.formatOnSave": true,
    "[typescript]": { "editor.defaultFormatter": "denoland.vscode-deno" },
  },
};
export const denoSettings = {
    "deno.enable": true,
    "deno.lint": true,
    "editor.formatOnSave": true,
    "[typescript]": { "editor.defaultFormatter": "denoland.vscode-deno" },
};

export { Mode };
