Scaffold a new React component for the PDF Narrator UI following project conventions.

Project conventions to follow exactly:
- File goes in `/components/ComponentName.tsx`
- First line: `"use client";`
- All styling via inline `style={{}}` using the project's color tokens — no Tailwind color classes for brand colors
- Color tokens: bg `#0d0d0f`, s1 `#15151a`, s2 `#1c1c23`, bdr `#2e2e3e`, bdr2 `#3a3a50`, gold `#d4a843`, goldl `#efc96a`, amber `#e07a3a`, cream `#ede0c8`, muted `#7a7a9a`
- Cards: `background: "linear-gradient(145deg, #15151a, #1a1a22)"`, `border: "1px solid #2e2e3e"`, `borderRadius: 16` (rounded-2xl)
- Section headers: `text-xs font-bold uppercase`, `color: "#d4a843"`, `letterSpacing: "0.12em"`
- Interactive elements: hover state via `onMouseEnter`/`onMouseLeave` changing `style` directly (not className toggling)
- No external component libraries
- Props interface defined inline above the component function
- No default export on the same line as the function — use `export default function Name()`

Steps:
1. Ask the user: what should the component do, what props does it receive, where will it be used?
2. Write the component following all conventions above
3. Write it to `/Users/devulapallisatya/Desktop/PDF Reader/components/ComponentName.tsx`
4. Run `npm run build` to confirm no type errors
5. Tell the user which file was created and what import statement to use
