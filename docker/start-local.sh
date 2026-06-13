#!/bin/sh
set -eu

cd /var/www/html

if [ -f /var/www/html/docker/local.env ]; then
  set -a
  . /var/www/html/docker/local.env
  set +a
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

composer install --no-interaction --prefer-dist

if ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --force --no-interaction
fi

echo '⏳ Waiting for database...'
until php -r 'try { new PDO("pgsql:host=".getenv("DB_HOST").";port=".getenv("DB_PORT").";dbname=".getenv("DB_DATABASE"), getenv("DB_USERNAME"), getenv("DB_PASSWORD")); exit(0); } catch (Throwable $e) { exit(1); }'; do
  sleep 1
done

echo '✅ Database is ready'
if php artisan migrate --force; then
  echo '✅ Migrations ran successfully'
else
  echo '⚠️  Migrations failed'
  if [ "${RUN_LOCAL_SEEDERS:-false}" = "true" ]; then
    echo '⏳ RUN_LOCAL_SEEDERS=true → running migrate:fresh --seed --force'
    php artisan migrate:fresh --seed --force
  else
    echo 'ERROR: migrate failed and RUN_LOCAL_SEEDERS is not enabled — exiting'
    exit 1
  fi
fi

echo ''
echo '✅ Laravel backend started successfully'
echo '🌐 App URL: http://localhost:8000'
echo ''

exec php artisan serve --host=0.0.0.0 --port=8000
