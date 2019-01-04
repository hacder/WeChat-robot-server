import {Context, wrapperEvents} from "./events";

const server = require('http').createServer();
const consola = require('consola');

const ws = require('socket.io')(server, {
    serveClient: false,
    pingInterval: 1000,
    pingTimeout: 5000,
    cookie: false
});


ws.on('connect', async (client) => {
    consola.info(`新客户端:${client.id}进入了服务器`);
    const ctx: Context = {
        server: ws,
        socket: client,
        client: client
    };
    await wrapperEvents(ctx);
});

//[20788]

server.listen(3008, () => {
    consola.info("Start At Port 3008");
});
