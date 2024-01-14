import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: './handler.js',
  output: {
    dir: './build',
    entryFileNames: '[name].dist.js'
  },
  plugins: [
    nodeResolve()
  ]
}