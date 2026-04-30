FROM serversideup/php:8.4-fpm-nginx

# Environment variables for Render
ENV AUTOCONF_PHPFPM_ROOT=/var/www/html/public
ENV AUTORUN_LARAVEL_MIGRATION=true
ENV AUTORUN_LARAVEL_STORAGE_LINK=true
ENV AUTORUN_LARAVEL_OPTIMIZE=true
ENV AUTORUN_LARAVEL_CACHE_CLEAR=true

# 1. SWITCH TO ROOT to handle system-level permissions
USER root

# Install GD extension dependencies and the extension itself
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# 2. Copy code and assign ownership directly to the web user
COPY --chown=www-data:www-data . .

# 3. Create missing folders and set permissions as root
RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# 4. SWITCH BACK TO WWW-DATA for security
USER www-data

# 5. Run Composer safely (ignoring scripts to save RAM)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
