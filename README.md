<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Teslo API

API REST para una tienda de ropa, construida con **NestJS**, **TypeORM** y **PostgreSQL**. Incluye autenticación con JWT, autorización por roles, CRUD de productos con paginación, subida de imágenes, un seed para datos de prueba y documentación con Swagger.

## Tecnologías

- [NestJS 11](https://nestjs.com/) (TypeScript)
- PostgreSQL 16 (en Docker) + TypeORM
- Passport + JWT para autenticación, bcrypt para hashear contraseñas
- class-validator / class-transformer para validar los DTOs
- Multer para subida de archivos
- Swagger (`@nestjs/swagger`) para la documentación

## Puesta en marcha

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.template` a `.env` y ajustar las variables (ver tabla abajo).
3. Levantar la base de datos:
   ```bash
   docker-compose up -d
   ```
4. Levantar la API en modo desarrollo:
   ```bash
   npm run start:dev
   ```
5. Cargar datos de prueba (⚠️ **borra** productos y usuarios existentes):
   ```
   GET http://localhost:3000/api/seed
   ```

La API queda en `http://localhost:3000/api` y la documentación interactiva de Swagger en **`http://localhost:3000/api`**.

### Variables de entorno

| Variable      | Descripción                                                          |
| ------------- | -------------------------------------------------------------------- |
| `DB_HOST`     | Host de PostgreSQL (`localhost`)                                     |
| `DB_PORT`     | Puerto expuesto por Docker (`5433`, mapeado al 5432 del contenedor)  |
| `DB_NAME`     | Nombre de la base de datos                                           |
| `DB_USERNAME` | Usuario de la base de datos                                          |
| `DB_PASSWORD` | Contraseña de la base de datos (también la usa `docker-compose`)     |
| `PORT`        | Puerto de la API (`3000`)                                            |
| `HOST_API`    | URL base de la API; se usa para construir la URL de las imágenes     |
| `JWT_SECRET`  | Clave secreta con la que se firman los tokens. Usa una propia y segura |

## Cómo funciona

### Arquitectura

El proyecto está dividido en módulos de Nest, cada uno con su controlador, servicio y DTOs:

```
src/
├── auth/       Registro, login, estrategia JWT, guards y decoradores de roles
├── products/   CRUD de productos e imágenes (entidades Product y ProductImage)
├── files/      Subida y consulta de imágenes de productos
├── seed/       Datos de prueba (usuarios y productos)
├── common/     Piezas reutilizables (PaginationDto, decorador RawHeaders)
├── app.module.ts
└── main.ts     Prefijo global /api, ValidationPipe y configuración de Swagger
```

En `main.ts` se aplica el prefijo global `api` y un `ValidationPipe` con `whitelist` y `forbidNonWhitelisted`: cualquier propiedad que no esté definida en el DTO es rechazada con un `400`.

### Autenticación y roles

1. El usuario se registra (`POST /api/auth/register`) o inicia sesión (`POST /api/auth/login`) y recibe un **JWT**.
2. Para acceder a rutas protegidas se envía el token en el header `Authorization: Bearer <token>`.
3. `JwtStrategy` valida el token y carga el usuario desde la base de datos; si el usuario está inactivo (`isActive = false`) se rechaza.
4. Las rutas se protegen con el decorador compuesto `@Auth(...roles)`, que une `AuthGuard` (JWT) y `UserRoleGuard` (comprueba que el usuario tenga alguno de los roles indicados). Sin roles, basta con estar autenticado.
5. `@GetUser()` inyecta en el handler el usuario autenticado.

Roles disponibles: `admin`, `super-user` y `user` (por defecto un usuario nuevo tiene `user`).

### Modelo de datos

- **User** → `id` (uuid), `email` (único), `password` (hash, no se devuelve en consultas), `fullName`, `isActive`, `roles[]`.
- **Product** → `id` (uuid), `title` (único), `slug` (único, se genera a partir del título si no se envía), `price`, `description`, `stock`, `sizes[]`, `gender`, `tags[]`.
- **ProductImage** → `id`, `url`. Pertenece a un producto y se elimina en cascada con él.
- Un **User** tiene muchos **Product** (se guarda quién creó/actualizó cada producto).

> `synchronize: true` está activo en TypeORM, por lo que las tablas se crean/actualizan automáticamente. Es cómodo en desarrollo, pero **no debe usarse en producción**.

### Productos

- `GET /api/products?limit=10&offset=0` devuelve los productos paginados (por defecto `limit=10`, `offset=0`).
- `GET /api/products/:term` busca por **UUID**, por **slug** o por **título**.
- Crear, actualizar y eliminar requieren el rol `admin`.
- Al actualizar un producto con `images`, las imágenes anteriores se reemplazan por las nuevas dentro de una transacción.

### Imágenes

1. Se sube la imagen con `POST /api/files/product` (campo `file` en `multipart/form-data`). Solo se aceptan `jpg`, `jpeg`, `png` y `gif`; el archivo se guarda en `static/products` con un nombre generado con UUID.
2. La respuesta incluye `secureUrl`, por ejemplo `http://localhost:3000/api/files/product/<nombre>.jpg`.
3. Esa URL se puede incluir en el arreglo `images` al crear o actualizar un producto.
4. `GET /api/files/product/:imageName` devuelve la imagen.

### Seed

`GET /api/seed` vacía las tablas de productos y usuarios, crea los usuarios de prueba definidos en `src/seed/data/seed-data.ts` y luego inserta los productos de ejemplo asociados al primer usuario. Úsalo solo en desarrollo.

## Endpoints principales

| Método | Ruta                           | Acceso        | Descripción                         |
| ------ | ------------------------------ | ------------- | ----------------------------------- |
| POST   | `/api/auth/register`           | Público       | Registrar usuario                   |
| POST   | `/api/auth/login`              | Público       | Iniciar sesión y obtener token      |
| GET    | `/api/auth/check-auth-status`  | Autenticado   | Renovar/validar token               |
| GET    | `/api/products`                | Público       | Listar productos (paginado)         |
| GET    | `/api/products/:term`          | Público       | Buscar por id, slug o título        |
| POST   | `/api/products`                | `admin`       | Crear producto                      |
| PATCH  | `/api/products/:id`            | `admin`       | Actualizar producto                 |
| DELETE | `/api/products/:id`            | `admin`       | Eliminar producto                   |
| POST   | `/api/files/product`           | Público       | Subir imagen de producto            |
| GET    | `/api/files/product/:name`     | Público       | Obtener imagen                      |
| GET    | `/api/seed`                    | Público       | Poblar la base de datos             |

Las rutas `/api/auth/private`, `/private2` y `/private3` son rutas de ejemplo para probar guards y roles.

## Scripts

```bash
npm run start:dev   # desarrollo con recarga automática
npm run build       # compilar a /dist
npm run start:prod  # ejecutar el build
npm run lint        # ESLint
npm run test        # tests unitarios
npm run test:e2e    # tests end-to-end
```
