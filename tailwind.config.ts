import type { Config } from 'tailwindcss'
import * as tailwindHighlights from 'tailwindcss-highlights'

export default {
  content: ["index.html", "src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    tailwindHighlights
  ],
  important: "body ",
} satisfies Config

