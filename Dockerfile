# Use the high-performance 2026 PHP 8.4 image
FROM serversideup/php:8.4-fpm-nginx

# Set the document root to Laravel's public folder
ENV AUTOCONF_PHPFPM_ROOT=/var/www/html/public

WORKDIR /var/www/html

# Copy your code into the container
COPY --chmod=755 . .

# Install dependencies (without dev tools to save that 512MB RAM)
RUN composer install --no-dev --optimize-autoloader

# Give the server permission to write to storage
RUN chmod -R 775 storage bootstrap/cache
