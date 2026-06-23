# Unidos por Piribebuy Web

Sitio web institucional desarrollado para presentar de forma clara y ordenada la propuesta pública de **Unidos por Piribebuy**. El proyecto reúne información del candidato, equipo, propuestas, noticias, agenda, datos electorales y herramientas de consulta pensadas para facilitar el acceso ciudadano a la información.

Este repositorio forma parte de mi portafolio técnico y refleja un trabajo enfocado en desarrollo web moderno, organización de contenido, experiencia de usuario y preparación para despliegue en producción.

**Autor:** Univ. Alejandro J. Villalba

## Objetivo del proyecto

El objetivo principal es contar con una plataforma web profesional, rápida, responsive y mantenible, preparada para publicarse en GitHub y desplegarse en Cloudflare Pages.

El sitio está organizado para que el contenido pueda actualizarse de manera simple desde archivos estructurados, manteniendo una separación clara entre datos, componentes visuales y rutas de navegación.

## Tecnologías utilizadas

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- Vite
- Tailwind CSS
- Radix UI
- Framer Motion
- Cloudflare Pages
- npm

## Requisitos

- Node.js 22 o superior
- npm 10.9.2 o compatible
- Cuenta de Cloudflare para despliegue en Pages

## Instalación local

```bash
npm install
```

## Instalación reproducible

Para entornos de integración continua o Cloudflare Pages:

```bash
npm ci
```

## Scripts disponibles

```bash
npm run dev        # inicia el entorno local de desarrollo
npm run check      # ejecuta la validación de TypeScript
npm run build      # genera el build de producción
npm run preview    # permite revisar el build localmente
npm run lint       # ejecuta la revisión con ESLint
npm run format     # aplica formato con Prettier
npm run deploy     # publica el build en Cloudflare Pages mediante Wrangler
```

## Desarrollo

Para levantar el proyecto en modo desarrollo:

```bash
npm run dev
```

Para validar el código antes de publicar cambios:

```bash
npm run check
npm run build
```

## Despliegue en Cloudflare Pages

Configuración recomendada en Cloudflare Pages:

```text
Install command: npm ci
Build command: npm run build
Output directory: dist/client
Root directory: /
```

El archivo `wrangler.json` de la raíz está configurado para Cloudflare Pages mediante `pages_build_output_dir`. Como el proyecto usa TanStack Start con SSR, el build también genera una configuración interna para el Worker que sirve la aplicación en producción.

```json
{
  "name": "unidos-piribebuy-web",
  "pages_build_output_dir": "./dist/client",
  "compatibility_date": "2026-04-29",
  "compatibility_flags": ["nodejs_compat"]
}
```

También se incluye `public/_redirects` como respaldo para rutas internas. La aplicación principal se sirve mediante el Worker generado por TanStack Start durante el build.

## Nota sobre Cloudflare Pages

El proyecto mantiene un `wrangler.json` en la raíz para declarar la configuración de Cloudflare Pages. Durante el build, TanStack Start y el plugin de Cloudflare generan una configuración interna en `dist/client/wrangler.json`; el script posterior al build la sanea para conservar el Worker SSR y remover campos no aceptados por el despliegue de Pages.

En el panel de Cloudflare Pages se debe usar explícitamente:

```text
Install command: npm ci
Build command: npm run build
Output directory: dist/client
```

La configuración recomendada es `npm run build`. Si Cloudflare muestra `bun run build`, conviene actualizar manualmente el comando de build en el panel para mantener npm como gestor principal del proyecto.

## Estructura principal

```text
src/
  components/       Componentes reutilizables de interfaz
  data/             Contenido editable del sitio
  hooks/            Hooks auxiliares
  lib/              Configuración compartida
  routes/           Rutas principales de la aplicación
public/             Activos públicos y archivos servidos directamente
```

## Privacidad y manejo de datos

El archivo `public/padron.json` debe tratarse con especial cuidado cuando contenga información real. Para repositorios públicos, demostraciones o entornos no autorizados, corresponde utilizar datos ficticios o una fuente protegida.

La carga, publicación y distribución de datos personales reales debe realizarse únicamente en entornos privados o de producción debidamente autorizados.

## Publicación en GitHub

```bash
git init
git add .
git commit -m "Prepare portfolio-ready release"
git branch -M main
git remote add origin https://github.com/avillalbavv/enmagini2026.git
git push -u origin main
```

## Autor

**Univ. Alejandro J. Villalba**
