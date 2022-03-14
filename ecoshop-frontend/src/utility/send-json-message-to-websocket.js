const sendJsonMessageToWebSocket = (ws, jsonMessage) => {
  ws.send(JSON.stringify(jsonMessage));
};

export default sendJsonMessageToWebSocket;
