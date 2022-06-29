state = {
    hasOpenWx: false,
    isLogin: false,
    userInfo: null,
    unRead: 0,
    tabid: null,
    chatList: [] // 聊天列表
}

var timeid;
var g_unread = 0;


//Blreay: 当用户不小心点击了鼠标或者离开了扩展的popup页面，此时需要对一些数据进行清空或者删除一些不必要的数据.
// 在background环境注册断开连接时需要处理的方法: https://www.jianshu.com/p/ff8c15e8d88e
chrome.runtime.onConnect.addListener(function (externalPort) {
    externalPort.onDisconnect.addListener(function() {
        var ignoreError = chrome.runtime.lastError;
        console.log("zzy200: onDisconnect");
        // 发送消失，把焦点设置为无效
        if (state.tabid) {
            chrome.tabs.sendMessage(state.tabid, {blur: true}, function(response){
                console.log('message has send to wxobserve.js for blurpage, tabid=' + state.tabid);
            });
        }
    });
});

//Blreay: 监听content script那边发送过来的数据（聊天列表、用户列表）
console.log('zzy003: set addListener done');
chrome.runtime.onMessage.addListener((request) => {
    // console.log("zzy001 msg arrived: " + request);

    if (request.unReadCount) {
        console.log(request);
        state.unRead = request.unReadCount.unReadCount;
        console.log("zzy03 unread = " + state.unRead);
        if (state.unread != 0) {
            g_unread = state.unread;
            /*
            chrome.notifications.create("id", {
                type : 'basic',
                title : ' XXXXXXX ',  // 这里我故意使显示这个为空，显得没那么拥挤
                message : 'Auto Recode Start · · ·',
                iconUrl : 'images/30.png'
            });
            */
        } else {
            g_unread = 0;
        }
    };

    //Blreay: donot response this message
    /*
    if (request.chatList) {

        state.chatList = request.chatList.chatList;
        // console.log("zzy001" + state.chatList);
        unread = 0;
        request.chatList.chatList.forEach(function(item, idx){
            if (item.NoticeCount == 0 || (item.MMInChatroom && item.Statues == 0)) {
                // console.log("zzy01 ignore" + item.NickName);
            } else {
                unread += item.NoticeCount;
                console.log("zzy01 unread = " + unread);
            }
        　});
    }
    */
});

var open_wx = function () {
    chrome.browserAction.setBadgeText({text: ''});
    chrome.browserAction.setBadgeBackgroundColor({color: '#ea594b'});

    chrome.runtime.onMessage.addListener(function (req) {
        if (req.update) {
            chrome.windows.getAll({
                populate: true
            }, function (wins) {
                wins.forEach(function (win) {
                    win.tabs.forEach(function (tab) {
                        //if (/wx2\.qq\.com/ig.test(tab.url)) {
                        if (/https:\/\/wx.*\.qq\.com/ig.test(tab.url)) {
                            state.tabid = tab.id;
                            console.log('set timeout for tab.id=' + tab.id);
                            clearTimeout(timeid);
                            if(0) {
                                // do nothing
                                console.log('no settimeout for tab.id=' + tab.id);
                            } else {
                            timeid = setTimeout(function () {
                                chrome.tabs.executeScript(tab.id, {
                                    file: 'chrome/wxInfo.js'
                                }, function (res) {
                                    var info = res[0];
                                    if (info.login) { // 已登录
                                        info.unreadCount = state.unRead;
                                        console.log('zzy004: get new unread count = ' + info.unreadCount);
                                        if (+info.unreadCount) {
                                            chrome.browserAction.setBadgeText({text: info.unreadCount + ''});
                                            if (info.unreadCount < 99) {
                                                chrome.browserAction.setBadgeText({text: info.unreadCount + ''});
                                            } else if (info.unreadCount >= 99) {
                                                chrome.browserAction.setBadgeText({text: '99+'});
                                            }
                                        } else {
                                            chrome.browserAction.setBadgeText({text: ''});
                                        }
                                    } else {
                                        chrome.browserAction.setBadgeText({text: ''});
                                    }
                                });

                                //blreay: get chat list once by force
                                /*
                                chrome.tabs.sendMessage(tab.id, {getChatList: true}, function(response){
                                    console.log('message has send to wxobserve.js by backgroud.js tab.id=' + tab.id)
                                    return;
                                });
                                */

                /*
                                chrome.windows.getAll({
                                    populate: true
                                }, (wins) => {
                                    wins.forEach(win => {
                                        win.tabs.forEach(tab => {
                                            if (/wx2\.qq\.com/ig.test(tab.url)) {
                                                    chrome.tabs.sendMessage(tab.id, {getChatList: true}, function(response){
                                                    console.log('message has send to wxobserve.js by backgroud.js tab.id=' + tab.id)
                                                    return;
                                                });
                                            }
                                        });
                                    });
                                });
                                */

                            }, 2000);
                        }
                        }
                    });
                });
            });
        }
    });

}

open_wx();