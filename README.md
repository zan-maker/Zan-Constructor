# Service Business Estimator Tool

A modern, AI-powered estimation tool for service businesses. Built with React 18, TypeScript, and Supabase.

## Features

### Core Features
- **Multi-industry templates** (Landscaping, Plumbing, HVAC, Electrical, Cleaning)
- **Smart calculation engine** with industry-specific formulas
- **Professional PDF/Excel exports**
- **Client sharing & approval workflow**
- **Free tier with email capture**

### Business Model
- **Free:** 10 estimates/month, 1 industry, PDF only
- **Starter ($29/mo):** 100 estimates, 3 industries, Excel export
- **Professional ($79/mo):** Unlimited, all industries, Word export
- **Business ($149/mo):** Team collaboration, API access

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + Headless UI
- Zustand (state management)
- React Hook Form + Zod (forms/validation)

### Backend
- Supabase (PostgreSQL + Auth + Storage)
- Supabase Edge Functions (serverless)
- Stripe (payments)
- Brevo (email)

### Infrastructure
- Vercel (frontend hosting)
- GitHub Actions (CI/CD)
- Sentry (error monitoring)
- Plausible (analytics)

## Project Structure

```
estimator-tool/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── templates/  # Industry templates
│   │   ├── hooks/      # Custom hooks
│   │   ├── store/      # Zustand stores
│   │   ├── utils/      # Utilities
│   │   └── types/      # TypeScript types
│   └── public/         # Static assets
├── backend/            # Supabase configuration
│   ├── migrations/     # Database migrations
│   ├── functions/      # Edge Functions
│   └── seed/          # Seed data
├── shared/            # Shared code
│   ├── types/         # Shared TypeScript types
│   └── utils/         # Shared utilities
└── infrastructure/    # Deployment configs
    ├── vercel/        # Vercel config
    └── github/        # GitHub Actions
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run development server: `npm run dev`
5. Open http://localhost:3000

### Environment Variables
```bash
# Frontend (.env.local)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Backend (Supabase environment variables)
STRIPE_SECRET_KEY=your_stripe_secret_key
BREVO_API_KEY=your_brevo_api_key
```

## Development Workflow

### Feature Development
1. Create feature branch: `git checkout -b feature/name`
2. Implement feature with tests
3. Run tests: `npm test`
4. Submit pull request

### Database Changes
1. Create migration: `supabase migration new migration_name`
2. Apply migration: `supabase db push`
3. Update TypeScript types: `supabase gen types typescript`

### Deployment
- **Staging:** Automatic on `develop` branch
- **Production:** Manual from `main` branch

## API Documentation

### REST API (Supabase)
- `POST /api/estimates` - Create new estimate
- `GET /api/estimates/:id` - Get estimate by ID
- `PUT /api/estimates/:id` - Update estimate
- `POST /api/estimates/:id/export` - Export estimate

### Webhooks
- Stripe webhooks for payment events
- Brevo webhooks for email events

## Testing

### Unit Tests
- Jest + React Testing Library
- Test components, hooks, and utilities

### Integration Tests
- Cypress for end-to-end testing
- Test user flows and payment integration

### Performance Tests
- Lighthouse CI for performance metrics
- Bundle size monitoring

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

MIT# Zander
