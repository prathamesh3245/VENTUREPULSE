// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react({
//       babel: {
//         plugins: [['babel-plugin-react-compiler']],
//       },
//     }),
//   ],
// })


//

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // ✅ Plain react() with NO babel-plugin-react-compiler.
    // That plugin rewrites component internals and causes recharts (and other
    // pre-compiler libraries) to call useContext(null) → "Invalid hook call".
    react(),
  ],
  resolve: {
    // Force a single copy of React across ALL packages (app + recharts + anything else).
    // Without this, npm may resolve multiple React instances → duplicate React error.
    dedupe: ['react', 'react-dom'],
  },
})
