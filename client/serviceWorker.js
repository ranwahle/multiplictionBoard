// importScripts('./background-sync.js');

const StaticFiles = ['/', 'board.js', 'board-style.css', 'guess-component.js','manifest.json',
     'index.html', 'index.js', 'fontawesome/all.css', 'webfonts/fa-solid-900.woff2'
, 'recorder.js', 'serviceWorker.js', 'images/icon-192.png', 'images/favicon-32x32.png'];
const CACHE_NAME = 'multipliction';
const progress = 0;

addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter( (cacheName) => {
                    // Return true if you want to remove this cache,
                    // but remember that caches are shared across
                    // the whole origin
                }).map( (cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

function fetchAndCache(request, cachedResponse) {
    console.log('cached response for request', request, cachedResponse)
    return fetch(request)
        .then((response) => {
            // Check if we received a valid response
            if (!response.ok) {
                console.error('response', response);
                //     throw Error(response.statusText);
            }
            return caches.open(CACHE_NAME)
                .then((cache) => {
                    if (request.method === 'POST') {
                        return response;
                    }
                    cache.put(request, response.clone());
                    return response;
                });
        })
        .catch(function (error) {
            return cachedResponse;
            // You could return a custom offline 404 page here
        });
}

self.addEventListener('fetch', function (event) {
    self.clientId = event.clientId;
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                return fetchAndCache(event.request, response);
            })
    );
});

addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cacheOpen => {
            return cacheOpen.addAll(StaticFiles);
        })
    );
})

self.addEventListener('sync', (event) => {
    console.log('sync');
    if (event.tag == 'progressSync') {
      event.waitUntil(sendProgress().then(
            console.log(progress)
      ));
    }
  });

self.addEventListener('progressincreased', event => {
    progress = event.detail.progress
})
  sendProgress = async () => {
    const progressData = {
        time: Date.now(), 
        progress
    };

    const response = await fetch('/api/progress', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(progressData)
    });

    const progressList = await response.json();

    console.log(progressList);

    return progressList;
    // if (progress !== 1) {
    //     setTimeout(this.sendProgress, ProgressInterval);
    // }
}
