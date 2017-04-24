var CACHE_NAME = 'my-site-cache-v8';
var urlsToCache = [
  'res/top.png',
  'res/test.js'
];

self.addEventListener('install', function(event) {
  console.log('sw install');
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        var promises;
        console.log('Opened cache');
        if(cache.addAll)
          return cache.addAll(urlsToCache);
        else{
          promises = urlsToCache.map(function(url){
              return cache.add(url);
          });
          return Promise.all(promises);
        }
      }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function (event) { // 监听worker的activate事件
  console.log('sw activate');
    event.waitUntil( // 延迟activate事件直到
        caches.keys().then(function(keys){
            return Promise.all(keys.map(function(key, i){ // 清除旧版本缓存
              console.log(key);
                if(key !== CACHE_NAME){
                    return caches.delete(keys[i]);
                }
            }))
        }).then(function() {
      //作用：安装service-worker之后，可使当前页面的请求经过下面的fetch事件，因为service-worker激活之后不一定会马上处理fetch事件,需要在下次刷新
      //后才能处理fetch事件
          return self.clients.claim(); //第一次新安装时有用，后续更新service-worker时则没用
          
        })
    )
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        var url = new URL(event.request.url);
        
        if (url.origin == location.origin && url.pathname == "/mask.png") {
          return caches.match('./res/top.png');
        }
        return fetch(event.request);
      }
    )
  );
});