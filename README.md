## 微信HOOK的api服务端

server 目录是提供一个socket-server

```bash
yarn socket:dev
```


## 提供事件API

```javascript
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
```


## 功能
-   [x] HOOK 二维码
-   [x] 用户是否登录
-   [x] 个人信息获取 
-   [ ] 好友列表 
-   [ ] 群友列表 
-   [ ] 好友信息获取 
-   [ ] 自动收款 
-   [x] 消息收取 
-   [x] 消息发送 


## 核心

更多核心组件查看：[DLL核心项目 ](https://github.com/zhaojunlike/WeChat-Inject-Hook)