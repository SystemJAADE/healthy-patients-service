###############################
# Build para desarrollo local #
###############################

FROM node:lts-bullseye-slim AS development

# Instalar las dependencias necesarias para hot reloading
RUN apt-get update && apt-get install -y procps make openssl

# Crear la carpeta de la app
WORKDIR /usr/src/app

# Copiar package.json, yarn.lock y Makefile a la imagen del contenedor.
# Copiar esto primero evita volver a ejecutar npm install en cada cambio de código.
COPY --chown=node:node package.json yarn.lock Makefile ./

COPY --chown=node:node prisma ./prisma

# Instalas todas las dependencias necesarias de la aplicación usando `npm ci` en ves de `npm install`
RUN make install-dev

# Generamos el cliente de prisma
RUN npx prisma generate

# Copiar todo el codigo fuente
COPY --chown=node:node . .

# Usar el usuario node desde la imagen (En lugar de root)
USER node

###############################
#    Build para producción    #
###############################

FROM node:lts-bullseye-slim AS build

RUN apt-get update && apt-get install -y make

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

# Para ejecutar `yarn run build` necesitamos acceso al Nest CLI.
# El Nest CLI es una dependencia de desarrollo,
# En la etapa de desarrollo anterior ejecutamos `yarn install` que instaló todas las dependencias.
# sí que podemos copiar el directorio node_modules de la imagen de desarrollo en esta imagen.
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# Ejecute el comando de compilación que crea los archivos de producción
RUN make build

# Establecer la variable de entorno NODE_ENV
ENV NODE_ENV production

# Ejecutar `npm ci` elimina el directorio node_modules existente.
# Pasando '--production --frozen-lockfile' asegura que solo las dependencias de producción son instaladas.
# Esto asegura que el directorio node_modules está lo más optimizado posible.
RUN make install-prod

USER node

###############################
#         Producción          #
###############################

FROM node:lts-bullseye-slim AS production

RUN apt-get update && apt-get install -y make

# Copiar lo generado en la etapa de compilación a la imagen de producción
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/bin/*.sh ./bin

USER node
