import * as dayjs from 'dayjs'
import axios from 'axios'

const consola = require('consola');

export interface Context {
    server: any,//服务端
    socket: any,//当前socket链接
    client: any
}


const types = {
    SEND_USER_INFO: 'SEND_USER_INFO',
    SEND_MESSAGE: 'SEND_MESSAGE',
    PONG: 'PONG',
    broadcast: 'broadcast',
    RECV_MESSAGE: 'RECV_MESSAGE',
    CMD_SEND_MESSAGE: 'CMD_SEND_MESSAGE',
    CMD_GET_LOGIN_USER: 'CMD_GET_LOGIN_USER',
    LOGIN_USER_INFO: 'LOGIN_USER_INFO'
};
const XMLConvert = require('xml-js');

export interface User {
    wxid: string,
    nickname: string,
    info: object,
    qrcode: string,
    avatar: string
}

export interface RecvMessage {
    wxid: string,//收到的消息
    //"25984984772519212@openim" ,8632008424@chatroom,9223372041393544365@im.chatroom,微信公众号不需要回复消息:gh_8191cec3a36c
    type: RecvMessageType,//0.个人消息，1.微信chatroom,2.企业微信im.chatroom，3.openim就是企业微信了，4.gh_开头就是公众号之类的
    senderId: string,
    message: object,
}

export enum RecvMessageType {
    WxUser = 0,
    CharRoom = 1,
    Gh = 4,
    ImCharRoom = 2,
    ImUser = 3,
}

export function parseRecvMessage(messageStr: string): RecvMessage {
    const msg = JSON.parse(messageStr);
    const recv: RecvMessage = {
        wxid: msg.wxid,
        type: 0,
        senderId: msg.sendId,//如果是群聊，这个senderId=""的时候，那么说明这个消息是我自己手机发送的，所以不用关系
        message: msg.message,
    };

    if (-1 !== msg.wxid.indexOf('@openim')) {
        //企业微信号
        recv.type = RecvMessageType.ImUser;
    } else if (-1 !== msg.wxid.indexOf('@im.chatroom')) {
        //企业微信群聊
        recv.type = RecvMessageType.ImCharRoom;
    } else if (-1 !== msg.wxid.indexOf('@chatroom')) {
        //微信群聊
        recv.type = RecvMessageType.CharRoom;
    } else if (-1 !== msg.wxid.indexOf('wxid_')) {
        //普通微信用
        recv.type = RecvMessageType.WxUser;
    } else if (-1 !== msg.wxid.indexOf('gh_')) {
        //普通微信用
        recv.type = RecvMessageType.Gh;
    }

    //开始解析消息
    let mgr: any = {msgType: '', message: ''};
    try {
        //管他的先转成 message
        mgr = XMLConvert.xml2js(msg.message, {nativeType: true, compact: true});
    } catch (e) {
        //普通文字消息
    }
    return recv;
}


//机器人
async function getRobotMsg(msg) {
    msg = encodeURIComponent(msg);
    const url = `http://api.qingyunke.com/api.php?key=free&appid=0&msg=${msg}`;
    const res: any = await axios.get(url);
    return res.data && res.data.content;
}

export async function WrapperEvents(ctx: Context) {
    const {socket, client, server} = ctx;
    const clientID = client.id;

    //当前登录的用户
    let user: User = {wxid: '', nickname: '', info: {}, qrcode: '', avatar: ''};
    let timer = null;
    let isLogin = false;

    //通知所有人
    server.emit('broadcast'); // emit an event to all connected sockets


    client.on(types.PONG, () => {

    });

    client.on('disconnect', () => {
        user = null;//释放用户资源
        consola.info(`客户端下线:${clientID}`);
        //客户端下线后，释放所有的客户端资源
        timer && clearInterval(timer);
        isLogin = false;
    });

    //如果wxid是空的话说明没有登录

    client.on(types.SEND_USER_INFO, (res) => {
        res = JSON.parse(res);
        isLogin = res.wxid !== '';
        if (res.wxid === '' && res.qrcode !== '' && res.qrcode !== '(null)') {
            const qr = `https://weixin.qq.com/x/${res.qrcode}`;
        }
        user.wxid = res.wxid;
        user.nickname = res.nickname;
        user.avatar = res.avatar;

        //广播当前用户
        server.emit(types.SEND_USER_INFO, user);
    });

    client.on(types.RECV_MESSAGE, async (res) => {
        const message = parseRecvMessage(res);

        server.emit(types.RECV_MESSAGE, message);
        consola.info("收到消息:" + JSON.stringify(message));
        if (message.type === RecvMessageType.Gh) {
            consola.info(`微信公众号不需要回复消息:${message.wxid}`);
            return;
        }
        let reply: string = '';
        try {
            reply = await getRobotMsg(message.message);
            //如果是一个表情
            reply = reply.replace(/{face:\d}/g, '[耶]');
        } catch (e) {
            reply = e.message;
        }
    });


    timer = setInterval(() => {
        client.emit(types.LOGIN_USER_INFO);
        client.emit(types.CMD_GET_LOGIN_USER);//一直监控用户登录是否
        if (false == isLogin) {
            return;
        }
        const message = "[耶]  时间" + dayjs().format('YYYY-MM-DD HH:mm:ss');
    }, 3000);//1分钟发一次消息
}