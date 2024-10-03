importScripts("/js/dexie.js");
importScripts("/js/db.js");

const limitCatch=(key,size)=>{
    caches.open(key).then(cache=>{
        cache.keys().then(keys=>{
            if (keys.length>size) {
               cache.delete(keys[0]).then(limitCatch(key,size)) 
            }
        })
    })
}
const cacheVersion = 5
const activeCatch = {
    static: `static-v${cacheVersion}`,
    dynamic: `dynamic-v${cacheVersion}`,

}
self.addEventListener('install', (event) => {
    // console.log('register');
    self.skipWaiting();

    event.waitUntil(
        caches.open(activeCatch['static']).then(cache => {
            // cache.add('js/app.js')
            cache.addAll(['/', 'js/app.js', 'css/style.css'])
        })
    )

})
self.addEventListener('activate', event => {
    console.log('acivated');
    const activeCacheNames = Object.values(activeCatch);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.forEach((cacheName) => {
              if (!activeCacheNames.includes(cacheName)) {
                return caches.delete(cacheName); // :))
              }
            })
          );
        })
      );
})
self.addEventListener('fetch', (event) => {
    const urls=['https://redux-cms.iran.liara.run/api/courses']

    //1-first cach-secound network
    if (urls.includes(event.request.url)) {
      return  event.respondWith(
            fetch(event.request).then(response=>{
                const clonrResponse=response.clone()
                clonrResponse.json().then(data=>{
                    for(let courses in data){
                        db.course.put(data[courses])
                    }
                })
                return response
            })
        )
    }else{
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response
            } else {
                return fetch(event.request).then(serverResponse=>{
                    caches.open([activeCatch['dynamic']]).then(cache=>{
                        cache.put(event.request,serverResponse.clone())
                        // limitCatch(activeCatch['dynamic'],5)
                        return serverResponse
                    })
                })
            }
        })
    )
    }

    //2-first network-secound cache
//    return event.respondWith(
//         fetch(event.request).then(response=>{
//            return caches.open([activeCatch['dynamic']]).then(cache=>{
//                 cache.put(event.request,response.clone())
//                 return response
//             }).catch(error=>{
//                 return caches.match(event.request)
//             })
//         })
//     )
})
self.addEventListener('sync',event=>{
    if (event.tag==='add-new-course') {
        console.log(event);
        addnewCourse()
    }
})
const addnewCourse=async()=>{

     db.syncCourses.toArray().then(data=>{
       data.forEach(async(course)=>{
        const res=await fetch('https://redux-cms.iran.liara.run/api/courses',{
            method:'POST',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: course.title,
              price: 0,
              category: "بک اند",
              registersCount: 40000,
              discount: 100,
              desc: "جاوا اسکریپت یکی از محبوب ترین زبان های برنامه نویسی در دنیا که در حوزه های مختلفی همچون وب اپلیکیشن ها و برنامه های موبایل و برنامه های برای سیسنم عامل ویندوز استفاده میشود ",
            }),
        })
        if (res.status===201) {
            db.syncCourses
            .where({title:course.title})
            .delete()
            .then(()=>{
                console.log('deleted success');
            })
            .catch(error=>console.log(error))
        }
       })
     })
      

}
self.addEventListener('notificationclick',event=>{
    const action=event.action
    const notification=event.notification
    console.log('event',event);
})
self.addEventListener("push", (event) => {
    // Show Event Notification
  });
  