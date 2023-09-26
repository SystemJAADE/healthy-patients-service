#!/usr/bin/env bash
set -e

echo "Cargando variables de entorno desde .env"
set -a
. ./.env
set +a

# Verificando la conexion a la base de datos MySQL
bin/wait-for-it.sh $DB_HOST:$DB_PORT

# Iniciando la aplicacion en modo desarrollo
yarn run start:dev