// Crea un contenedor para notificaciones
const notificationContainer = document.createElement("div");
notificationContainer.style.position = "fixed";
notificationContainer.style.bottom = "20px";
notificationContainer.style.right = "20px";
notificationContainer.style.zIndex = "1000";
document.body.appendChild(notificationContainer);

// Estilo básico para notificaciones
const style = document.createElement("style");
style.textContent = `
  .simple-notification {
    background: #4CAF50;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    margin-top: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    animation: fadeIn 0.3s, fadeOut 0.3s 2.7s forwards;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;
document.head.appendChild(style);

// Conexión SSE
const eventSource = new EventSource("http://localhost:3000/app/assist-notify");

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const notification = document.createElement("div");
  notification.className = "simple-notification";
  notification.textContent = data.message;

  notificationContainer.appendChild(notification);

  // Auto-eliminar después de 3 segundos
  setTimeout(() => {
    notification.remove();
  }, 3000);
};
