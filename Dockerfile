FROM serversideup/php:8.4-fpm-nginx

# Set document root
ENV AUTOCONF_PHPFPM_ROOT=/var/www/html/public

WORKDIR /var/www/html

# 1. Copy your code
COPY . .

# 2. Fix permissions BEFORE running composer
# We create the folders and set permissions so 'package:discover' can write to them
RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# 3. Now run composer (it won't crash now)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# No need for chmod here anymore, it's already done
