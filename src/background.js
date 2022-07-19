state = {
    hasOpenWx: false,
    isLogin: false,
    userInfo: null,
    unRead: 0,
    tabid: null,
    winid: null,
    nickname: null,
    chatList: [] // 聊天列表
}

var timeid;
var g_unread = 0;

winid_set = new Set();
winid_map = new Map();

check_win_id = (winid, obj, ok_func, ng_func) => {
    try {
        chrome.windows.get(winid, {
            populate: true,
            windowTypes: ['popup']
        }, (win) => {
            win.tabs.forEach(tab => {
                // console.log("zzy100 check_win_id: " + winid + " url: " + tab.url);
                if (/https:\/\/wx.*\.qq\.com/ig.test(tab.url)) {
                    console.log("zzy100 check_win_id matched: " + winid + " url: " + tab.url);
                    state.tabid = tab.id;
                    ok_func(tab.id, obj);
                } else {
                    ng_func();
                }


            });
        });
    } catch (e) {
        console.error('Chrome extension, winid seems invalid:' + winid);
        console.log(e);
        ng_func();
    }
}


//Blreay: 当用户不小心点击了鼠标或者离开了扩展的popup页面，此时需要对一些数据进行清空或者删除一些不必要的数据.
// 在background环境注册断开连接时需要处理的方法: https://www.jianshu.com/p/ff8c15e8d88e
chrome.runtime.onConnect.addListener(function (externalPort) {
    externalPort.onDisconnect.addListener(function () {
        var ignoreError = chrome.runtime.lastError;
        console.log("zzy200: onDisconnect tabid=" + state.tabid);

        values = winid_map.values();
        for (i = 0; i < winid_map.size; i++) {
            value = values.next().value;
            // info.unreadCount += value.unReadCount.unReadCount;
            console.log("zzy111 send blur " + value.window_id + "  tabid=" + value.tabid);
            // 发送消失，把焦点设置为无效
            if (value.tabid) {
                chrome.tabs.sendMessage(value.tabid, { blur: true }, function (response) {
                    console.log('message has send to wxobserve.js for blurpage, tabid=' + value.tabid);
                });
            }
        }

    });
});

//Blreay: 监听content script那边发送过来的数据（聊天列表、用户列表）
console.log('zzy003: set addListener done');
chrome.runtime.onMessage.addListener((request) => {
    // console.log("zzy001 msg arrived: " + request);

    /*
    if(request.winid != state.winid) {
        console.log("received an invalid msg from winid=" + request.winid + ", expected winid=" + state.winid + ", ignore it");
        return;
    }
    */
    if (request.unReadCount) {
        console.log(request);
        state.unRead = request.unReadCount.unReadCount;
        state.nickname = request.unReadCount.nickname;
        let cur_winid = parseInt(request.window_id)

        //console.log("zzy03 unread = " + state.unRead);
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

        check_win_id(cur_winid, null, function (tabid, obj) {
            request.tabid = tabid;
            if (winid_map.has(cur_winid)) {
                // update
                winid_map.get(cur_winid).unreadCount = request.unReadCount;
                winid_map.get(cur_winid).tabid = tabid;
            } else {
                // insert
                winid_map.set(cur_winid, request);
            }
            chrome.tabs.executeScript(tabid, {
                file: 'chrome/wxInfo.js'
            }, function (res) {
                var info = res[0];
                /*
                if(info.nickname != state.nickname) {
                    console.log("received an invalid msg from nickname=" + state.nickname + ", expected nickname=" + info.nickname + ", ignore it");
                    return;
                }
                */
                // calculate total unread
                info.unreadCount = 0;
                values = winid_map.values();
                for (i = 0; i < winid_map.size; i++) {
                    value = values.next().value;
                    console.log(value);
                    info.unreadCount += value.unreadCount.unReadCount;
                    console.log("zzy109 " + value.window_id + "  count=" + value.unreadCount.unReadCount + " total=" + info.unreadCount);
                }
                if (info.login) { // 已登录
                    // info.unreadCount = state.unRead;
                    console.log('zzy004: get new unread count = ' + info.unreadCount);
                    if (+info.unreadCount) {
                        chrome.browserAction.setBadgeText({ text: info.unreadCount + '' });
                        if (info.unreadCount < 99) {
                            chrome.browserAction.setBadgeText({ text: info.unreadCount + '' });
                        } else if (info.unreadCount >= 99) {
                            chrome.browserAction.setBadgeText({ text: '99+' });
                        }
                    } else {
                        chrome.browserAction.setBadgeText({ text: '' });
                    }
                } else {
                    chrome.browserAction.setBadgeText({ text: info.unreadCount + '' });
                    console.log("zzy119 OMG info.login is false, but got unreadcound, now  info.unreadCount = " + info.unreadCount);
                }
            });
        }, function () {
            console.log("winid is invalid");
        })
    };
    if (request.broadcast_winid) {
        console.log("broadcast_winid from " + request.broadcast_winid);
        broadcast_winid(request.broadcast_winid);
    }


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

var set_wx_winid = function (id, tabid, private) {
    //state.winid = id;
    var request = new Object();
    request.tabid = tabid;
    request.window_id = id;
    request.private = private;
    winid_map.set(id, request);
    //winid_set.add(id);
    console.log("zzy110: weixin windowid is added to map: " + id + ' private=' + request.private);
}

var get_wx_winid = function () {
    console.log("zzy111: weixin windowid is returned with  " + winid_map.keys());
    console.log(winid_map);
    return winid_map;
}

var broadcast_winid = function (str) {
    console.log("zzy111: broadcast_winid is called by " + str);

    values = winid_map.values();
    for (i = 0; i < winid_map.size; i++) {
        value = values.next().value;

        var tabid = value.tabid;
        var winid = value.window_id;
        var private1 = value.private;
        console.log("zzy112 " + value.window_id + "  tabid=" + tabid + ' private=' + private1 + " run executeScript");
        // set winid to wx page
        chrome.tabs.executeScript(tabid, {
            code: " \
                console.log('zzy500: im runned'); \
                var tag='body'; \
                var node = document.getElementsByTagName(tag)[0]; \
                var paramsContainer = document.createElement('div'); \
                paramsContainer.style.display = 'none'; \
                paramsContainer.setAttribute('id', 'blreay_paramsContainer'); \
                paramsContainer.setAttribute('blreay_winid', " + winid + "); \
                paramsContainer.setAttribute('blreay_private', " + private1 + "); \
                if (document.getElementById('blreay_paramsContainer')) { node.removeChild(document.getElementById('blreay_paramsContainer'));} \
                node.appendChild(paramsContainer); \
                console.log('winid is set to: ' + document.getElementById('blreay_paramsContainer').getAttribute('blreay_winid') + ' private is set to ' + document.getElementById('blreay_paramsContainer').getAttribute('blreay_private')); \
                "
        }, res => {
            let info = res[0];
            console.log("zzy500-1: executeScript result: " + info);
            console.log(info);
        });
    }

    return;
}

var open_wx = function () {
    chrome.browserAction.setBadgeText({ text: '' });
    chrome.browserAction.setBadgeBackgroundColor({ color: '#ea594b' });

    chrome.runtime.onMessage.addListener(function (req) {
        if (req.update) {

        }

    });

}

open_wx();