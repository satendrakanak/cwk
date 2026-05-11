self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "CodeWithKasa notification",
    body: "You have a new update.",
    url: "/notifications",
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/assets/pwa-icon-192.png",
      badge: "/assets/pwa-icon-192.png",
      image: payload.imageUrl || undefined,
      data: {
        url: payload.url || "/notifications",
        notificationId: payload.notificationId,
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/notifications";
  const notificationId = event.notification.data?.notificationId;

  const markClicked = notificationId
    ? fetch(`/api/notifications/${notificationId}/click`, {
        method: "PATCH",
        credentials: "same-origin",
      }).catch(() => undefined)
    : Promise.resolve();

  event.waitUntil(
    markClicked.then(() =>
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        const existingClient = clients.find((client) =>
          client.url.includes(self.location.origin),
        );

        if (existingClient) {
          existingClient.focus();
          existingClient.navigate(targetUrl);
          return;
        }

        return self.clients.openWindow(targetUrl);
      }),
    ),
  );
});
