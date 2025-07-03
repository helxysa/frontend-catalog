import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
      webpackConfig: {
        resolve: {
          alias: {
            "next/navigation": require.resolve("next-router-mock/navigation"),
          },
        },
      },
    },
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
