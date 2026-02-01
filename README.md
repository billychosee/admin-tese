# TESE Admin Portal

A production-grade admin portal for the TESE video platform, built with Next.js, TypeScript, and Tailwind CSS.

## Overview

This admin portal provides a comprehensive dashboard for managing the TESE video platform, including user management, content moderation, analytics, and system administration.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Charts**: Custom SVG-based charts
- **Icons**: Custom SVG icon set

## Design System

The portal uses a premium, fintech-quality design language with a dark-mode-first approach.

### Color Palette

| Name | Hex Code |
|------|----------|
| Independence Black | `#1A1A1A` |
| Harvest Green | `#2E7D32` |
| Gold Standard | `#F9A825` |
| Heartbeat Red | `#C62828` |
| Off-White | `#F5F5F5` |

### Design Principles

- Subtle animations and motion
- Clean typography and spacing
- Dark-mode-first design
- Premium, modern aesthetic

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── categories/        # Categories management
│   ├── creators/          # Content creators management
│   ├── videos/            # Videos management
│   ├── featured/          # Featured creators management
│   ├── transactions/      # Transactions management
│   ├── devices/           # Devices & sessions management
│   ├── login/             # Admin login page
│   └── register/          # Admin registration page
├── components/
│   ├── layout/            # Layout components (Sidebar, TopBar, etc.)
│   ├── providers/         # Context providers (Theme, Sidebar)
│   └── ui/                # Reusable UI components
├── services/
│   ├── api.ts             # API service layer
│   └── mockData.ts        # Mock data for development
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── constants/             # Application constants
└── middleware.ts          # Authentication middleware
```

## Core Features

### Collapsible Sidebar Navigation

- Fixed left sidebar with smooth width transitions
- Expanded state: Full TESE logo with menu labels
- Collapsed state: Logo replaced with favicon, icons only
- State persisted in localStorage
- Tooltips visible when collapsed
- Fully keyboard accessible

### Theme System

- Light and Dark mode support
- Dark mode is default on first load
- User preference persisted in localStorage
- Smooth transitions between themes

### Authentication (Admin)

- Admin Registration with email, password, confirmation
- Admin Login with email and password
- Mock authentication with token handling
- Middleware-based route protection
- Auth layouts with admin-only guards

### Frontend Loaders

- Full-page loaders
- Section loaders
- Button loaders with spinner
- Skeleton loaders for:
  - Tables
  - Cards
  - Charts
- Unified loading behavior
- Empty and retry states

### Dashboard

- Statistics cards with growth indicators
- Transaction overview chart
- Revenue overview chart
- Recent transactions list
- Quick actions panel

### Categories Management

- Full CRUD operations
- Status toggles (active/inactive)
- Confirmation modals for destructive actions
- Search and filter functionality

### Content Creators

- List and Grid view toggle
- Search and filters
- Online status display (seconds → days)
- Status management (Active/Pending/Suspended)
- Creator profile modal
- SmatPay merchant details display
- Approve/Reject actions
- Activate/Deactivate actions

### Videos Management

- List-first layout with optional grid
- Filters (free/paid/status)
- Delete/Suspend/Deactivate actions
- Promote to featured or banner
- Search functionality

### Featured Creators

- List view default with grid option
- Reordering functionality
- Toggle featured status
- Remove from featured

### Transactions

- Full system transactions list
- Filters and search
- Override status
- Refund marking
- Flag suspicious activity (UI only)

### Devices & Location (UI Only)

- IP address display
- Device list with type icons
- Location information
- Active sessions display
- Max device rule (configurable)
- Force logout functionality

### Security (Frontend)

- Middleware-based route protection
- Role-based UI guards
- No sensitive data in localStorage
- Centralized error handling
- Input sanitization
- Confirm destructive actions

### UX Requirements

- Breadcrumbs navigation
- Skeleton loading states
- Empty states
- Error boundaries
- Toast notifications
- Accessibility support (ARIA labels, keyboard navigation)

## Configuration

### Next.js Configuration

The `next.config.js` includes:
- `trailingSlash: true` - URLs end with `/`
- `reactStrictMode: true` - React strict mode enabled
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Image domain placeholders

### Tailwind Configuration

Custom theme extension includes:
- Custom color palette
- Custom animations
- Custom box shadows
- Custom background images
- Responsive breakpoints

## Getting Started

### Installation

Node modules are already installed. To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000/`

### Default Credentials

For testing:
- Email: `admin@tese.com`
- Password: Any password (mock authentication)

## Mock Data Usage

The application uses mock data in `services/mockData.ts` for development. This includes:
- Sample users
- Sample transactions
- Sample creators
- Sample videos
- Sample categories
- Sample devices

Replace mock data with real API calls when backend is ready.

## Backend Integration

### API Service Layer

The `services/api.ts` file provides a centralized API service layer with:
- Typed requests and responses
- Mock adapters replaceable with real APIs
- Error handling
- Loading states

### Replacing Mock Data

To integrate with a real backend:

1. Update `services/api.ts` to use real API endpoints
2. Replace mock data functions with actual API calls
3. Update type definitions in `types/index.ts` to match backend DTOs
4. Configure environment variables for API base URL

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://api.tese.com
```

## Trailing Slash Rationale

The `trailingSlash: true` configuration provides:
- Consistent URL formatting
- Better SEO compatibility
- Easier server configuration
- Standardized routing

## Security Considerations

- Authentication tokens stored in cookies (not localStorage for sensitive data)
- Middleware protection for all protected routes
- Input validation on forms
- CSRF protection via same-site cookies
- XSS prevention via React's automatic escaping
- Rate limiting ready (implement on backend)

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - TESE Platform
