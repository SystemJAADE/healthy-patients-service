#!/usr/bin/env bash
set -e

export DB_NAME="$TEST_DB_NAME"
export DB_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Verificando la conexion a la base de datos MySQL
bin/wait-for-it.sh $DB_HOST:$DB_PORT

# Reseteando la base de datos
npx prisma migrate reset --force --skip-seed

# Aplicando migraciones a la base de datos
npx prisma migrate dev --name init

# Ejecutando los seeds
yarn run seed

# Eliminando los archivos de migraciones creados por prisma
# Esto se hace porque queremos mantener la base de datos sincronizada
# siempre cada vez que se inicie la aplicacion en modo desarrollo,
# pero no queremos que se generen archivos de migraciones en el directorio,
# ya que eso es trabajo de los desarrolladores
rm -rf prisma/migrations

yarn run test