# Shelf Space

Shelf Space is a modern, high-performance physical asset management system. Designed for teams that move fast, it provides total visibility and control over hardware and software assets across every location.

## Features

- **Activity Timeline:** Monitor an immutable stream of every checkout, update, and movement across your inventory in real-time.
- **Centralized Registry:** Your single source of truth to manage all physical hardware and equipment in one unified, searchable dashboard.
- **Visual Locations:** Track assets across multiple offices or remote sites with integrated map views.
- **Command Search:** Quickly find assets, locations, or actions using a powerful global command palette (⌘K).
- **Fast & Responsive UI:** Built with modern web technologies and optimized for zero N+1 database queries.

## Demo Access

The application includes a `DemoLoginController` designed for viewers and guests to quickly explore the system without requiring manual account creation. Simply click **"View Demo"** on the landing page to instantly access the fully populated environment.

## Tech Stack

- **Backend:** Laravel 13 (PHP 8.4)
- **Frontend:** React 19, Inertia.js v3
- **Styling:** Tailwind CSS v4, Framer Motion
- **Testing:** Pest v4
- **Routing:** Laravel Wayfinder

## Requirements

- PHP 8.4+
- Composer
- Node.js & npm
- A supported database (SQLite, MySQL, or PostgreSQL)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd shelf-space
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies:**
   ```bash
   npm install
   ```

4. **Configure your environment:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Run migrations and seed the database:**
   ```bash
   php artisan migrate --seed
   ```

6. **Start the development servers:**
   ```bash
   # Terminal 1: Laravel Server
   php artisan serve

   # Terminal 2: Vite Dev Server
   npm run dev
   ```

## Testing

This project uses Pest as its primary testing framework. To run the test suite:

```bash
composer test
# or
./vendor/bin/pest
```

---

## Credits

- **UI Components:** Built with [shadcn/ui](https://ui.shadcn.com/).
- **Inspiration:** Design inspired by [shelf.nu](https://shelf.nu/).
