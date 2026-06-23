const cacheFile = 'cache.json';
const cacheName = 'simulador-cache';
let cacheData;

// Base de datos indexedDB donde se almacenan las ubicaciones seleccionadas 
// por el usuario (de las que se descargarán la imagenes para usar offline).
/**
 * Nombre de la base de datos indexedDB.
 */
const dbName = 'simulador-ubicaciones';
/**
 * Versión de la base de la base de datos (indexedDB soporta migraciones).
 */
const dbVersion = 1;
/**
 * Conexión a la base de datos una vez haya sido abierta correctamente.
 */
let db;

/**
 * Conecta con la base de datos indexedDB, la inicializa en caso de ser
 * necesario.
 * 
 * @returns {Promise} Promise con la conexión a la base.
 */
const conectarIndexedDB = () => {
    return new Promise((resolve, reject) => {
        const openDbRequest = indexedDB.open(dbName, dbVersion);
        openDbRequest.onerror = () => {
            console.error('Error al abrir la base de datos indexedDB', openDbRequest.error);
            reject(openDbRequest.error);
        };
        openDbRequest.onsuccess = () => {
            resolve(openDbRequest.result);
            console.log('Conexión con la base de datos indexedDB exitosa');
        };
        openDbRequest.onupgradeneeded = () => {
            const dbConn = openDbRequest.result;
            if (!dbConn.objectStoreNames.contains('ubicaciones')) {
                dbConn.createObjectStore('ubicaciones', { autoIncrement: true });
                console.log('Se creó el objectStore "ubicaciones"');
            }
            resolve(dbConn);
        };
    });
};


/**
 * Almacena en la base indexedDB la lista de ubicaciones elegidas por el usuario
 * para usar de manera offline.
 * 
 * @param {string[]} ubicaciones Lista de las ubicaciones a almacenar.
 * @returns {Promise}
 */
const guardarUbicaciones = ubicaciones => {
    return new Promise((resolve, reject) => {
        if (db) {
            const transaction = db.transaction('ubicaciones', 'readwrite');
            const ubicacionesStore = transaction.objectStore('ubicaciones');
            const request = ubicacionesStore.add(ubicaciones);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            }
        } else {
            reject('No se pudieron guardar las ubicaciones especificadas por falta de conexión a la base de datos indexedDB.');
        }
    });
};

/**
 * Obtiene la lista de ubicaciones a cachear offline de la base de datos.
 * 
 * @returns {Promise<string[]>} la lista de ubicaciones.
 */
const obtenerUbicaciones = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            const transaction = db.transaction('ubicaciones', 'readonly');
            const ubicacionesStore = transaction.objectStore('ubicaciones');
            const request = ubicacionesStore.get(1);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            }
        } else {
            reject('No se pudieron obtener las ubicaciones especificadas por falta de conexión a la base de datos indexedDB.');
        }
    });
};

/**
 * Descarga las imágenes de las ubicaciones especificadas guardándolas en
 * el cache del navegador para poder usar el simulador offline.
 * 
 * @param {string[]} ubicaciones lista de ubicaciones a cachear.
 */
const cachearUbicaciones = ubicaciones => caches.open(cacheData.cache)
    .then(
        cache => {
            return Promise.all(cacheData.imagenes
                .filter(element => ubicaciones.includes(element.codigo))
                .map(element => {
                    console.log('Cacheando las imágenes de la ubicación', element.codigo);
                    return cache.addAll(element.archivos);
                }));
        }
    );

/**
 * Intenta descargar de internet el archivo {@link cacheFile}, guardarlo en
 * cache y descargar los archivos generales (no descarga las imágenes de 
 * candidatos y los logos de partidos, listas, etc.).
 * Si no puede obtener el archivo {@link cacheFile} de internet usa la versión
 * cacheada, si la hay. En caso contrario, no se inicia el service worker hasta
 * que se pueda descargar el archivo {@link cacheFile}.
 * En este evento se borran las versiones viejas de la cache que puedan haber
 * quedado en el navegador.
 * 
 * @returns {Promise}
 */
const inicializarServiceWorker = async () => {
    try {
        cacheData = await fetch(cacheFile)
            .then(async response => {
                const cache = await caches.open(cacheName);
                cache.put(cacheFile, response.clone());
                return await response.json();
            });
    } catch(e) {
        // Uncaught (in promise) Error
        // error de red, no se pudo descargar cacheFile
        const response = await caches.match(cacheFile);
        if (!response)
            return Promise.reject(`${cacheFile} no estaba cacheado y no se pudo descargar.`);
        cacheData = response.json();
    }
    const cacheKeys = await caches.keys();
    // Limpiar versiones viejas del cache
    for (const key of cacheKeys) {
        if (key !== cacheData.cache && key !== cacheName) {
            console.log('Borrando cache antiguo', key);
            await caches.delete(key);
        }
    }
    let promises = [];
    // Obtengo las ubicaciones a cachear y si las hay agrego
    // las imágenes a la lista de archivos a cachear
    const ubicaciones = await obtenerUbicaciones();
    if (ubicaciones) {
        promises.push(cachearUbicaciones(ubicaciones));
    }
    // Solo descarga todos los archivos si no existe un cache con el
    // uuid especificado
    if (!cacheKeys.includes(cacheData.cache)) {
        const cache = await caches.open(cacheData.cache);
        console.log('Descargando archivos a cache...', cacheData.archivos);
        promises.push(cache.addAll(cacheData.archivos));
    } else {
        /**
         * Existe la caché con el uuid especificado. A continuación se verifica
         * que todos los archivos estén en la caché, caso contrario, se agregan
         * los archivos que falten. Esto es necesario por ejemplo, cuando se instala
         * la aplicación, ya que de no hacerlo se instalaría la aplicación con archivos
         * faltantes y ya no se podría navegar offline.
        */
        const cache = await caches.open(cacheData.cache);
        const archivos_promises = cacheData.archivos.map((archivo) => {
            return new Promise((resolve) =>
                cache.match(archivo).then((response) => {
                    // El archivo se encontró en la caché, se resuelve la promise.
                    if (typeof response !== "undefined") return resolve();
                    // No se encontró el archivo en la caché, se envía la petición 
                    // a agregar a la caché y una vez agregada se resuelve la promise 
                    return cache.add(archivo).then(() => resolve());
                })
            );
        });
        promises = promises.concat(archivos_promises)
    }
    return Promise.all(promises);
};

/**
 * Maneja el evento *activate* del service worker.
 * 
 * @param {ExtendableEvent} event 
 */
const serviceWorkerActivate = event => {
    console.log('ServiceWorker activado.');
    self.clients.claim();
};

/**
 * Maneja el evento *install* del service worker.
 * 
 * @param {InstallEvent} event 
 */
const serviceWorkerInstall = event => {
    console.log('Service Worker instalado.');
    event.waitUntil(
        conectarIndexedDB()
            .then(async connection => {
                db = connection;
                return inicializarServiceWorker();
            })
    );
};

/**
 * Maneja el evento *fetch* del service worker.
 * Siempre que el recurso se encuentre cacheado devuelve la copia local, sino
 * lo descarga de internet, cachea el resultado y lo devuelve.
 * 
 * @param {FetchEvent} event 
 */
const serviceWorkerFetch = event => {
    const sufragioRegexp = /(.*\/sufragio.html).*/;
    let request = event.request;
    const match = sufragioRegexp.exec(event.request.url);
    if (match) {
        request = new Request(match[1]);
    }
    event.respondWith(
        caches.match(request, {ignoreSearch: true}).then(
            r => {
                return r || fetch(event.request).then(
                    async response => {
                        if (!cacheData) {
                            inicializarServiceWorker();
                            console.log('El cache no está listo todavía.');
                        } else {
                            const cache = await caches.open(cacheData.cache);
                            console.log('Cacheando nuevo recurso:', event.request.url);
                            cache.put(event.request, response.clone());
                        }
                        return response;
                    }
                );
            }
        )
    );
};

/**
 * Maneja el evento *message* del service worker.
 * Si el mensaje es de tipo <code>{command: 'CACHEAR_IMAGENES', data: ['EJ.1']}</code>
 * cachea las imágenes del campo *data*.
 * 
 * @param {ExtendableMessageEvent} event 
 */
const serviceWorkerMessage = event => {
    const { command, data } = event.data;
    console.log('Llegó un mensaje', event.data);
    if (command === 'CACHEAR_IMAGENES') {
        guardarUbicaciones(data)
            .then(() => cachearUbicaciones(data))
            .then(
                () => {
                    console.log('Se cachearon las imagenes de las ubicaciones seleccionadas.');
                    clients.get(event.source.id)
                        .then(client => client.postMessage({command: 'IMAGENES_CACHEADAS'}));
                },
                reason => {
                    console.error('Error al cachear las imágenes.', reason);
                    clients.get(event.source.id)
                        .then(client => client.postMessage({command: 'ERROR_CACHEANDO_IMAGENES', error: reason}));
                }
            );
    }
};

self.addEventListener('install', serviceWorkerInstall);
self.addEventListener('activate', serviceWorkerActivate);
self.addEventListener('fetch', serviceWorkerFetch);
self.addEventListener('message', serviceWorkerMessage);