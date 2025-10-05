// CAMBIO 1: Versión de caché forzada a 'v4'. Esto es CRÍTICO para asegurar que el navegador 
// de tu celular elimine el Service Worker antiguo y cargue esta versión corregida.
const CACHE_NAME = 'saldo-magico-v4';

// CAMBIO 2: Rutas corregidas a RELATIVAS (./) para GitHub Pages de proyecto.
// También se incluyó la librería html2canvas, vital para la instalación.
const urlsToCache = [
    // Rutas relativas para que funcione en https://usuario.github.io/nombre-de-tu-repo/
    './', 
    './index.html',
    './manifest.json', 
    './icon-192x192.png',
    './icon-512x512.png',
    
    // Incluir la librería de terceros que usas en index.html.
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',

    'https://cdn.tailwindcss.com',
];

self.addEventListener('install', (event) => {
    // Instala el service worker y guarda los archivos en caché
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caché abierto. Iniciando caché de recursos...');
                return cache.addAll(urlsToCache)
                    .catch(err => {
                        // Si falla aquí, la PWA no se instala. Esto se debía a las rutas absolutas.
                        console.error('Error al cachear recursos (rutas 404), el service worker no se instalará:', err);
                    });
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Intercepta las peticiones de red y sirve los archivos desde la caché si están disponibles
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Caché hit - devuelve la respuesta de la caché
                if (response) {
                    return response;
                }
                // No hay respuesta en la caché, continúa con la petición de red
                return fetch(event.request);
            })
            .catch(() => {
                // Estrategia de fallback para asegurar que si no hay red, se muestre el index.
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('No hay conexión y el recurso no está cacheado.');
            })
    );
});

self.addEventListener('activate', (event) => {
    // Limpia los cachés antiguos (v1, v2, v3)
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Tomar el control de las páginas existentes inmediatamente
    return self.clients.claim(); 
});
