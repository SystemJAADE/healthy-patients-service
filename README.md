<h1 align="center">Healthy API TS</h1>

Healthy es un sistema de gestión administrativa diseñado específicamente para centros de salud. Este sistema de gestión ofrece soluciones eficaces como la gestión de citas, gestión de pacientes, gestión de trabajadores, gestión de medicamentos, entre muchas otras funcionaliades. Con una interfaz intuitiva y fácil de usar, Healthy simplifica la gestión de centros de salud, lo que permite una mayor eficiente en la atención médica.
Esta API Rest es la que le da vida a Healthy, cuenta con una arquitectura escalable y segura.

# Requisitos obligatorios

- Docker y docker-compose

# Requisitos obligatorios (Instalación manual)

- Node.js v18 o superior (Testeado en 19.4.0)
- Yarn (Testeado en v1.22.19)
- MySQL 8.0.xx o superior o MariaDB (Testeado en 8.0.27)

# Requisitos opcionales (Instalación manual)

Para facilitar el manejo de la app (Ejecución y compilación) se recomienda instalar make.

- Make (Suele venir preinstalado en Linux)
- [GNUWin32](https://gnuwin32.sourceforge.net/install.html) o [MingW](https://www.ics.uci.edu/%7Epattis/common/handouts/mingweclipse/mingw.html) (Windows)

# Instalación con docker

## Configurando las variables de entorno

```ssh
# Copiamos el .env de ejemplo
cp .env.example .env

# Lo modificamos a nuestras necesidades
nano .env
```

## Configurando un reverse proxy con nginx

```ssh
# Copiamos el archivo de configuracion de ejemplo
cp ext/nginx.conf.example ext/nginx.conf

# Lo modificamos a nuestras necesidades
nano ext/nginx.conf
```

## Orquestación con docker-compose

Luego, para orquestar los contenedores con docker-compose usar:

```
# Iniciamos todos los contenedores en modo detached
docker-compose up -d
# Listo!
```

En caso de cambios en el docker-compose.yml

```
docker-compose down
```

Y luego ejecutar

```
docker-compose up -d -V --build
```

Adicionalmente, estos comandos pueden ayudarte en caso de que necesites saber el estado de los contenedores:

```sh
# Listar contenedores
docker container ls

# Obtener los logs de un contenedor
# Reemplazar <container_name> con el nombre del contenedor:
# Ejemplos:
# - docker container logs healthy-next-api-ts-api-1
# - docker container logs healthy-next-api-ts-mysql-1
docker container logs <container_name>
```

Para más información, revisa la [documentación de docker-cli](https://docs.docker.com/engine/reference/commandline/cli/).

# Instalacion manual

## Instalando los requisitos

```sh
# NodeJS v18 no esta disponible nativamente,
# pero podemos confiar en el repo de nodesource para ello
# https://github.com/nodesource/distributions
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalando NodeJS v18 y MySQL Server
sudo apt install -y nodejs mysql-server nginx

# Instalando las dependencias del proyecto
make install-dev
```

## Creando una base de datos

Necesitarás crear una base de datos para poder almacenar datos persistentes.

```sh
# Inicia el servidor de base de datos
sudo systemctl start mysql

# Iniciar sesion en el shell de mysql con la cuenta root
sudo mysql
```

Desde este shell de mysql, necesitaremos crear una base de datos, crear un usuario y darle al usuario todos los permisos hacia la base de datos.
Luego también tendremos que configurar la aplicación para que use esta base de datos.

```sql
-- Necesitaras cambiar estos valores por los que deseas usar
-- DB_NAME
-- DB_USER
-- DB_PASS

-- Creando la base de datos para healthy-next-api
CREATE DATABASE DB_NAME;

-- Creando un usuario para que use la base de datos
CREATE USER 'DB_USER'@'localhost' IDENTIFIED BY 'DB_PASS';

-- Darle al usuario acceso total para acceder a todas las tablas de healthy-next-api
GRANT ALL PRIVILEGES ON DB_NAME.* TO 'DB_USER'@'localhost';

-- Cerciorarnos de que los cambios de privilegios se hayan aplicado inmediatamente
FLUSH PRIVILEGES;

-- Salir del shell de mysql
quit
```

## Configurando un reverse proxy con nginx

Esta aplicación no requiere de un reverse proxy para funcionar pero estaremos usando uno gracias a todas sus ventajas que nos proporcionan, como por ejemplo:

- Facil y centralizado soporte de TLS (HTTPS)
- Ocultar las características y existencia de los servidores de origen.
- Multi-dominio
- Distribuir la carga de solicitudes entrantes a distintos servidores
- Comprimir contenido, optimizándolo y acelerando los tiempos de carga.

Nginx es un servidor web eficiente y de código abierto que usaremos para esta guía, pero no dude en consultar otros, como caddy, apache o h2o.

```sh
# Copiar el fichero de configuracion de ejemplo a /etc/nginx/sites-available
# y crearemos un enlace simbolico hacia /etc/nginx/sites-enabled
sudo cp ext/nginx.conf.example /etc/nginx/sites-available/healthy.conf
sudo ln -s /etc/nginx/sites-available/healthy.conf /etc/nginx/sites-enabled/healthy.conf

# Lo modificamos a nuestras necesidades
sudo nano /etc/nginx/sites-available/healthy.conf

# Recargamos el fichero de configuracion desde el disco
sudo nginx -s reload
```

## Configurando las variables de entorno

```ssh
# Copiamos el .env de ejemplo
cp .env.example .env

# Lo modificamos a nuestras necesidades
nano .env
```

## Finalizando la instalacion

Si todo salió bien, deberías ser capaz de iniciar healthy-next-api:

```sh
make run-dev
```

Puedes verificar que la aplicación está ejecutándose correctamente ingresando desde su navegador en la dirección: `https://api.example.com`

Para acceder a la documentación de la API, accede a la dirección: `https://api.example.com/api`

(Reemplaza `api.example.com` con la dirección que pusiste en `nginx.conf` anteriormente)

## Licencia

Este software se publica bajo una licencia personalizada de Microsoft Reference Source License (MS-RSL). (ver aquí [Licencia](LICENSE.md))
