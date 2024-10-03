if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(register => {
    console.log(register);
  }).catch(error => {
    console.log(error);
  })
} else {
  console.log('not ok');
}
const btn = document.querySelector('.add-course')
const showNotifBtn = document.querySelector(".show-notif");
const videoElem = document.querySelector(".video");
const canvasElem = document.querySelector(".canvas");
const takePhotoElem = document.querySelector(".take-photo");
const showLocationBtn = document.querySelector(".show-location");
const addedcourse = () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {

    navigator.serviceWorker.ready.then(sw => {
      const newCourse = {

        title: "next.js",
      };

      db.syncCourses
        .put(newCourse)
        .then((data) =>
          console.log("New course info inserted successfully :)) =>", data)
        )
        .catch((err) => console.log("Err =>", err));

      return sw.sync.register("add-new-course").then(() => {
        console.log('exist');
      }).catch(error => console.log('not'))
    })
  }
}
btn.addEventListener('click', addedcourse)
const fetchApi = async () => {
  try {
    const res = await fetch("https://redux-cms.iran.liara.run/api/courses");
    const data = await res.json()
    // const courses = []
    // for (let course in data) {
    // courses.push(data[course])
    // }
    return data
  } catch (error) {
    const data = await db.course.toArray();
    return data;
  }

}
const postsFetch = (data) => {
  const coursesParent = document.querySelector("#courses-parent");
  coursesParent.innerHTML = ''
  data.forEach(item => {
    coursesParent.insertAdjacentHTML(
      "beforeend",
      `
              <div class="col">
                <div class="card" style="width: 18rem">
                  <img
                  
                    src="/assets/images/post02.png"
                    class="card-img-top"
                    alt="Course Cover"
                  />
                  <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="card-text">
                      Some quick example text to build on the card title and make up
                      the bulk of the card's content.
                    </p>
                    <a href="#" class="btn btn-primary">Go somewhere</a>
                  </div>
                </div>
              </div>
          `
    );
  });
}

const urlBase64ToUint8Array = (base64String) => {
  var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
const notifPermisioncheck = async () => {
  if (navigator.permissions) {
    let result = await navigator.permissions.query({ name: 'notifications' })
    console.log('result', result);
    return result.state
  }
}
 const showNotification=()=>{
  //    new Notification("Notification Title", {
  //   body: "Notification Body :))",
  // });
 //way2
 if ("serviceWorker" in navigator) {
  navigator.serviceWorker.ready.then((sw) => {
    sw.showNotification("Notification Title (SW)", {
      body: "hi",
      dir: "ltr",
      vibrate: [100, 50, 200],
      icon: "./assets/images/pwa.jpeg",
      badge: "./assets/images/logo.webp",
      image: "./assets/images/pwa.jpeg",
      tag: "test-notification",
      actions: [
        { action: "confirm", title: "Accept" },
        { action: "cancel", title: "Cancel" },
      ],
    });
  });
}
 }
 const getCurrentNotif=async()=>{
   const sw=await navigator.serviceWorker.ready
   const currentNotif=await sw.pushManager.getSubscription()
   console.log('currentNotif',currentNotif);
   return currentNotif
 }
 const pushNotif=async()=>{
  if ('serviceWorker' in navigator){
    const sw=await navigator.serviceWorker.ready
    const pushSubscription=await sw.pushManager.subscribe({
      userVisibleOnly:true,
      applicationServerKey:urlBase64ToUint8Array("BH3GhMm7YfJhhDh2zBdgF6HVYHyWTWuwdvAXSFwMEjFoO6VKVZnnVdyBuWVd0vbJYSSW7WWYKc4HXEmJ2SwvokI")
    });
    console.log('pushSubscription',pushSubscription);
    return pushSubscription
  }else{

  }
}
const sendPushSubscriptionToServer=async(pushSubscription)=>{
  const res=await fetch(`http://localhost:4001/api/subs/save`,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pushSubscription),
  })
  console.log("Response =>", res);

  const data = await res.json();

  console.log("Response Data =>", data);


  console.log("pushSubscription sent successfully :))");
  return data
}
const getNotificationPermission = async() => {
  //way 1
  Notification.requestPermission().then(result => {
    if (result === 'granted') {
      showNotification()

      getCurrentNotif().then(currentNotif=>{
if (!currentNotif) {
  pushNotif().then(subnotif=>{
    sendPushSubscriptionToServer(subnotif)
  })
}
      })
      console.log('granted');
    } else if (result === 'denied') {
      console.log('granted');
    }
  })
  //way 2
  // const notfpermission = Notification.permission;
  // console.log('notfpermission', notfpermission);
  // //way3
  // const notifPermisionchecked=await notifPermisioncheck()
  // console.log('notifPermisionchecked',notifPermisionchecked);
}
const getMediaPermission = () => {
  if ("getUserMedia" in navigator) {
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: true })
      .then((stream) => (videoElem.srcObject = stream))
      .catch((err) => console.log("Stream Error =>", err));
  } else {
    console.log("مرورگر شما از قابلیت استریم پشتیبانی نمی‌کند");
  }
};
const takePhoto=()=>{
  const context=canvasElem.getContext('2d')
  canvasElem.style.display='block'
  videoElem.style.display='none'
  takePhotoElem.style.display='none'
  context.drawImage(videoElem,0,0,canvasElem.clientWidth,525)
  videoElem.srcObject.getVideoTracks().forEach(track=>track.stop())
}
const hasAccessPhoto=async()=>{
  const devices=await navigator.mediaDevices.enumerateDevices()
  console.log('devices',devices);
  let hasDevice=false
  devices.forEach(item=>{
    if (item.kind==='videoinput') {
      hasDevice=true
    }
  })
  return hasDevice
}
const geoSuccessCallback = (posotion) => {
  console.log("طول جغرافیایی ->", posotion.coords.longitude);
  console.log("عرض جغرافیایی ->", posotion.coords.latitude);
};

const geoErrorCallback = (err) => {
  console.log("Geo Error -> ", err);

  switch (err.code) {
    case 0: {
      console.log("Unknown Error !!");
      break;
    }
    case 1: {
      console.log("User denied Geolocation !!");
      break;
    }
    case 2: {
      console.log("Potision not found !!");
      break;
    }
    case 3: {
      console.log("TimeOut !!");
      break;
    }
  }
};
const getLocation=()=>{
  if ("geolocation" in navigator) {

    navigator.geolocation.getCurrentPosition(geoSuccessCallback,geoErrorCallback)
  }
  }
  showLocationBtn.addEventListener("click", getLocation);
takePhotoElem.addEventListener('click',takePhoto)
showNotifBtn.addEventListener("click", getNotificationPermission);
window.addEventListener('load', async () => {
  const posts = await fetchApi()
  postsFetch(posts)
 const isDEvice=await hasAccessPhoto()
 if (isDEvice) {
  //  getMediaPermission()
   
 }
})

