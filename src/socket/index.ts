import {Context, WrapperEvents} from "./events";
import {getKl8Data} from "./spider";

const server = require('http').createServer();
const consola = require('consola');

const ws = require('socket.io')(server, {
    serveClient: false,
    pingInterval: 1000,
    pingTimeout: 5000,
    cookie: false
});

//定义一下客户端的SocketId
const clients: any = {};
//这个是微信号的Clients
const wechats: any = {};

ws.on('connect', async (client: any) => {
    const handshake = client.handshake;
    const {query, headers} = handshake;
    if (query.ct === 'client') {
        consola.info(`新客户端:${client.id}进入了服务器`);
        clients[client.id] = client.id;
    } else {
        consola.info(`微信端已启动:${client.id}进入了服务器`);
        wechats[client.id] = client.id;
    }
    const ctx: Context = {
        server: ws,
        socket: client,
        client: client,
    };
    await WrapperEvents(ctx);

    client.on('disconnect', () => {
        clients[client.id] && delete clients[client.id]
    });
});


server.listen(3008, () => {
    consola.info("Start At Port 3008");
});

const schedule = require('node-schedule');


const current = {
    pc28: ''
};

const job = schedule.scheduleJob('*/5 * * * * *', () => {
    consola.info('task is running!');
    //启动会哦去数据
    getKl8Data({id: 1}).then(res => {
        const first = res[0];
        if (first.expect !== current.pc28) {
            ws.emit('data.pc28', res);//更新数据
        }
        current.pc28 = first.expect;
        //存储所有得数据
    }).catch(err => {
        consola.error(err.message);
    });

});