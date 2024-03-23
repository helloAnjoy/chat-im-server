var WebSocketServer=require("ws").Server;//引入该模块，并未模块下的对象取一个别名
var url = require('url');//该模块用于解析url参数，属于一个系统自带的工具模块
var connections={};//此对象用来保存认证通过的用户连接
global.wsServer=new WebSocketServer({//创建websocket服务器实例，并提升该实例的作用域为全局，以便其他模块可以访问
    port:3001,//设置服务器监听端口号，客户端连接时会向此端口发起连接请求
    verifyClient: function(info){
        //授权验证回调方法，客户端向服务器发起连接时，服务器可以根据客户端发送过来的url进行安全性检查，
        // 检查通过该方法应该返回true，表示允许客户端建立连接；失败返回false表示拒绝客户端的连接
        var query=url.parse(info.req.url, true).query;//提取客户端传过来的url参数，生成一个对象
        var account=query.account;//提取用户账号信息
        if(global.loginUsers[account]){//判断用户是否已经登录成功过了，在用户调用登录接口成功后，将其信息存入此map中
            console.log("用户"+account+"登录授权成功!")
            connections[account]=info.req.connection;
            return true;//认证通过,允许客户端建立连接
        }else{
            console.error("用户"+account+"登录授权失败!")
            return false;//认证失败,拒绝客户端连接
        }
    }
});
global.wsServer.connections=connections;
/**
 * 监听客户端（浏览器）连接事件
 * 一条连接 = 服务端websocket + 浏览器端websocket
 * 如果有N个用户在线，就有N对websocket，你可以理解websocket就是两个人用来打电话的两个手机
 * 客户端和服务器的通信过程就像两个人利用手机通电话一样的原理
 * 小明（客户端）要给小红（服务器）打电话：
 *  1、小红需要先找到手机，并开机，等待小明的电话到来（服务器引入ws模块，并创建websocket服务器对象实例）
 *  2、小明打开拨号界面，输入小红的手机号（浏览器端js创建websocket，并传入服务器地址 ：端口号 ? 请求参数）
 *  3、小红判断是否是自己认识的朋友的电话，如果是，就接电话，如果不是，就挂断电话(服务器接收到客户端的连接请求，判断url及参数条件是否满足，如果不满足，则拒绝连接)
 *  4、如果是认识的朋友小明，则接电话，接到电话后，会听到小明说话的声音(服务器连接建立成功后，onmessage方法会接收到客户端发送过来的消息)
 *  5、小红说话通过手机传递给小明的手机，小明就听到了小红说的话(服务器找到负责连接该客户端的服务器websocket，通过该websocket.send方法发送消息给浏览器端发起建立连接的websocket，在该websocket的onmessage方法中就可以接收到服务器发过来的消息)
 *    注：因为小红有多个手机可以同时接听多个朋友的电话，所以需要找到对应的手机回复某个朋友信息，服务器可以同时和多个客户端简历连接所以需要找到对应的websocket才能回复消息给指定的用户
 *  整个聊天过程就完成了
 */
wsServer.on("connection",function(ws){
    //客户端在verifyClient方法认证通过后会与服务器建立连接，建立连接成功后会调用此方法，
    //建立成功一个连接后，服务器会分配一个独立的ws对象(服务端websocket)与客户端的websocket进行通信
    console.log("onConnection ");
    for(var key in connections){//遍历查找对应的websocket对应的sokect，将用户信息与websocket进行关联，以便于根据用户信息找到该连接信息
        if(ws._socket==connections[key]){
            connections[key]=ws;
        }
    }
    /**
     * 监听客户端发送过来的信息，这里指定交给方法onMessage进行处理
     */
    ws.on("message",onMessage);
    /**
     * 如果连接在中途出现了错误，如网络连接失败等等，这里指定回调方法onError进行处理
     */
    ws.on("error",onError);
    /**
     * 当连接刚建立成功时触发此事件，这里指定回调方法onOpen进行处理
     */
    ws.on("open",onOpen);
    /**
     * 当连接断开时触发此事件，这里指定回调方法onClose进行处理
     * 连接关闭有一下几种场景：
     * 1、浏览器主动发起关闭连接
     * 2、服务器主动关闭客户端连接
     * 3、服务器网络故障
     * 4、浏览器端网络故障
     * 5、服务器停了
     * 6、浏览器关闭
     */
    ws.on("close",onClose);
});

function onOpen(){
    console.log("onOpen ws="+this);

}

function onClose(){
    console.log("onClose ws="+this);
    //寻找该连接，进行剔除
    for(var key in connections){
        if(this._socket==connections[key]){
            delete connections[key];
        }
    }
}

/**
 * 当接收到客户端发送的消息时回调
 * @param msg
 */
function onMessage(msg){
    console.log("onMessage msg="+msg);
    var data=JSON.parse(msg);//将浏览器端发送过来的json字符串转换为js对象，便于操作

    if(data.type=='chatMsg'){//判断消息类型是否是聊天消息
        if(!connections[data.toUserId]){//判断该消息接收者用户是否在线
            //用户不在线，则通知消息发送者，提示消息接收者不在线
            var resp={
                type:'notifyMsg', //通知消息
                code:'userNotOnline', //用户不在线
                msg:'用户不在线,无法跟他聊天!'
            }
            this.send(JSON.stringify(resp));
        }else{
            //消息接收者在线，则找到消息接收者的服务端websocket将消息转发给消息接收者的客户端websocket
            connections[data.toUserId].send(msg);
        }
    }else{
        //其他类型消息处理,预留出来，方便以后拓展

    }
}

/**
 * 当发生连接异常时回调
 * @param err
 */
function onError(err){
    console.log("onError err="+err);
}
