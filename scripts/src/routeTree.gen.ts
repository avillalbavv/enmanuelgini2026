import { Route as rootRouteImport } from './routes/__root'
import { Route as PropuestasRouteImport } from './routes/propuestas'
import { Route as PracticaVotoRouteImport } from './routes/practica-voto'
import { Route as PadronRouteImport } from './routes/padron'
import { Route as NoticiasRouteImport } from './routes/noticias'
import { Route as InfoElectoralRouteImport } from './routes/info-electoral'
import { Route as EquipoRouteImport } from './routes/equipo'
import { Route as ContactoRouteImport } from './routes/contacto'
import { Route as BiografiaRouteImport } from './routes/biografia'
import { Route as IndexRouteImport } from './routes/index'

const PropuestasRoute = PropuestasRouteImport.update({
  id: '/propuestas',
  path: '/propuestas',
  getParentRoute: () => rootRouteImport,
} as any)
const PracticaVotoRoute = PracticaVotoRouteImport.update({
  id: '/practica-voto',
  path: '/practica-voto',
  getParentRoute: () => rootRouteImport,
} as any)
const PadronRoute = PadronRouteImport.update({
  id: '/padron',
  path: '/padron',
  getParentRoute: () => rootRouteImport,
} as any)
const NoticiasRoute = NoticiasRouteImport.update({
  id: '/noticias',
  path: '/noticias',
  getParentRoute: () => rootRouteImport,
} as any)
const InfoElectoralRoute = InfoElectoralRouteImport.update({
  id: '/info-electoral',
  path: '/info-electoral',
  getParentRoute: () => rootRouteImport,
} as any)
const EquipoRoute = EquipoRouteImport.update({
  id: '/equipo',
  path: '/equipo',
  getParentRoute: () => rootRouteImport,
} as any)
const ContactoRoute = ContactoRouteImport.update({
  id: '/contacto',
  path: '/contacto',
  getParentRoute: () => rootRouteImport,
} as any)
const BiografiaRoute = BiografiaRouteImport.update({
  id: '/biografia',
  path: '/biografia',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/biografia': typeof BiografiaRoute
  '/contacto': typeof ContactoRoute
  '/equipo': typeof EquipoRoute
  '/info-electoral': typeof InfoElectoralRoute
  '/noticias': typeof NoticiasRoute
  '/padron': typeof PadronRoute
  '/practica-voto': typeof PracticaVotoRoute
  '/propuestas': typeof PropuestasRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/biografia': typeof BiografiaRoute
  '/contacto': typeof ContactoRoute
  '/equipo': typeof EquipoRoute
  '/info-electoral': typeof InfoElectoralRoute
  '/noticias': typeof NoticiasRoute
  '/padron': typeof PadronRoute
  '/practica-voto': typeof PracticaVotoRoute
  '/propuestas': typeof PropuestasRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/biografia': typeof BiografiaRoute
  '/contacto': typeof ContactoRoute
  '/equipo': typeof EquipoRoute
  '/info-electoral': typeof InfoElectoralRoute
  '/noticias': typeof NoticiasRoute
  '/padron': typeof PadronRoute
  '/practica-voto': typeof PracticaVotoRoute
  '/propuestas': typeof PropuestasRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/biografia'
    | '/contacto'
    | '/equipo'
    | '/info-electoral'
    | '/noticias'
    | '/padron'
    | '/practica-voto'
    | '/propuestas'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/biografia'
    | '/contacto'
    | '/equipo'
    | '/info-electoral'
    | '/noticias'
    | '/padron'
    | '/practica-voto'
    | '/propuestas'
  id:
    | '__root__'
    | '/'
    | '/biografia'
    | '/contacto'
    | '/equipo'
    | '/info-electoral'
    | '/noticias'
    | '/padron'
    | '/practica-voto'
    | '/propuestas'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  BiografiaRoute: typeof BiografiaRoute
  ContactoRoute: typeof ContactoRoute
  EquipoRoute: typeof EquipoRoute
  InfoElectoralRoute: typeof InfoElectoralRoute
  NoticiasRoute: typeof NoticiasRoute
  PadronRoute: typeof PadronRoute
  PracticaVotoRoute: typeof PracticaVotoRoute
  PropuestasRoute: typeof PropuestasRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/propuestas': {
      id: '/propuestas'
      path: '/propuestas'
      fullPath: '/propuestas'
      preLoaderRoute: typeof PropuestasRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/practica-voto': {
      id: '/practica-voto'
      path: '/practica-voto'
      fullPath: '/practica-voto'
      preLoaderRoute: typeof PracticaVotoRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/padron': {
      id: '/padron'
      path: '/padron'
      fullPath: '/padron'
      preLoaderRoute: typeof PadronRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/noticias': {
      id: '/noticias'
      path: '/noticias'
      fullPath: '/noticias'
      preLoaderRoute: typeof NoticiasRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/info-electoral': {
      id: '/info-electoral'
      path: '/info-electoral'
      fullPath: '/info-electoral'
      preLoaderRoute: typeof InfoElectoralRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/equipo': {
      id: '/equipo'
      path: '/equipo'
      fullPath: '/equipo'
      preLoaderRoute: typeof EquipoRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/contacto': {
      id: '/contacto'
      path: '/contacto'
      fullPath: '/contacto'
      preLoaderRoute: typeof ContactoRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/biografia': {
      id: '/biografia'
      path: '/biografia'
      fullPath: '/biografia'
      preLoaderRoute: typeof BiografiaRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  BiografiaRoute: BiografiaRoute,
  ContactoRoute: ContactoRoute,
  EquipoRoute: EquipoRoute,
  InfoElectoralRoute: InfoElectoralRoute,
  NoticiasRoute: NoticiasRoute,
  PadronRoute: PadronRoute,
  PracticaVotoRoute: PracticaVotoRoute,
  PropuestasRoute: PropuestasRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
