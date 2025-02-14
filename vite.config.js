export default {
    root: 'src/',
    publicDir: '../static/',
    base: './',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        target: 'es2022'
  },
    esbuild: {
      target: "es2022"
    },
    optimizeDeps:{
      esbuildOptions: {
        target: "es2022",
      }
    }
}