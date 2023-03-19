#!/usr/bin/env bash
set -e

# Verificando la conexion a la base de datos MySQL
bin/wait-for-it.sh $DB_HOST:$DB_PORT

# Iniciando la aplicacion en modo desarrollo
node dist/main.js