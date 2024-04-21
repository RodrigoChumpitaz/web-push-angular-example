"use strict";

self.addEventListener("push", function (event) {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.description,
      // icon: data.icon,
      // badge: data.badge,
      // vibrate: data.vibrate,
      // data: data.url,
      // actions: data.actions,
    })
  );
});
