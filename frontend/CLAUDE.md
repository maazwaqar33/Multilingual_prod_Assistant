# Frontend Guidelines

## Stack
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript

## Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx     # Root layout with fonts/providers
│   │   ├── page.tsx       # Dashboard page
│   │   └── globals.css    # Tailwind theme
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   └── features/      # Feature specific components
│   ├── lib/
│   │   ├── api.ts         # API client
│   │   └── utils.ts       # Helper functions
│   └── types/             # TypeScript definitions
└── public/
```

## Styling
- Use Tailwind CSS utility classes
- Use `clsx` or `tailwind-merge` for conditional classes
- Mobile-first approach (`md:`, `lg:` prefixes)
- Use semantic colors (`bg-primary`, `text-muted-foreground`)

## Component Rules
- Functional components with TypeScript interfaces
- Props interface exported as `ComponentNameProps`
- `"use client"` directive only where interactivity is needed
- Accessibility (ARIA) attributes required

## API Integration
- API Client in `src/lib/api.ts`
- Access Backend at `http://localhost:8000` (dev)
- Use Environment variable `NEXT_PUBLIC_API_URL`

## Referenced Specs
- `@specs/ui/components.md` - Component definitions
- `@specs/features/task-crud.md` - Feature behavior

## Running
```bash
cd frontend
npm run dev
```
