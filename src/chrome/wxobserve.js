let resetTime = 60 * 1000 * 2;
let isLost = false;
let resetTimer = null;
let currentWinID = null;


// currentWinID = window.id;
// console.log('zzy100: wxobserve.js is loaded, current_window_id=' + currentWinID);

/*
chrome.windows.getCurrent(function (currentWindow) {
	console.log('当前窗口ID：' + currentWindow.id);
    currentWinID = currentWindow.id;
});
*/

window.id

document.addEventListener('DOMContentLoaded', function() {

    window.addEventListener('blur', function() {
        // focusLost reset chat item
        // isLost = true;
        // resetTimer = setTimeout(() => {
        //     injectScript(chrome.extension.getURL('chrome/blurPage.js'), 'body');
        // }, resetTime);
    });
    window.addEventListener('focus', function() {
        // if (resetTimer) {
        //     resetTimer = null;
        //     isLost = false;
        //     resetTime = 60 * 1000 * 2;
        // }
    });

    // popup通知content script才去拿数据
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.getChatList) {
            console.log('zzy100: injectScript for catchChatList');
            var winid = document.getElementById('blreay_paramsContainer').getAttribute('blreay_winid');
            injectScript(chrome.extension.getURL('chrome/catchChatList.js'), 'body');
            // fix bug: message is received multiple times
            // https://zhuanlan.zhihu.com/p/144330696?from_voters_page=true
            // window.addEventListener("message", function(e) {
            window.onmessage = function(e){
                console.log('收到了来自inject script的信息(chrome/catchChatList.js):')
                // console.log(e)
                // console.log(e.data.data);
                // 将inject script拿到的数据发给popup展示
                chrome.runtime.sendMessage({chatList: e.data.data, window_id: winid});
            };
            //}, false);
            return;
        }

        if (request.username) {
            console.log('zzy100: injectScript for username:' + request.username);
            injectScript(chrome.extension.getURL('chrome/activeChatItem.js'), 'body', { username: request.username });
            return;
        }

        if (request.loginout) {
            console.log('zzy100: injectScript for loginout');
            injectScript(chrome.extension.getURL('chrome/loginOut.js'), 'body');
            return;
        }

        //Blreay: Pop窗口消失的时候，Blur主窗口，避免当前聊天对话来了新消息后，会自动设置为“已读”状态。
        if (request.blur) {
            console.log('zzy100: injectScript for blur');
            injectScript(chrome.extension.getURL('chrome/blurPage.js'), 'body');
            return;
        }
    });

    //Blreay: 后台持续往前台发送未读信息数量，显示在右上角, 间隔10s
    //本来是持续发全部的chatlist, 但是发现很占CPU，而且运行一会儿会内存不足异常退出。
    setInterval(function(e){
        // 后台发送unread message count
        // console.log('zzy102: injectScript for chrome/getUnreadCount.js');
        var winid = document.getElementById('blreay_paramsContainer').getAttribute('blreay_winid');
        console.log("zzy600: winid from blreay_paramsContainer.blreay_winid = " + winid);
        injectScript(chrome.extension.getURL('chrome/getUnreadCount.js'), 'body');
        // fix bug: message is received multiple times
        // https://zhuanlan.zhihu.com/p/144330696?from_voters_page=true
        window.onmessage = function(e){
            console.log('zzy100: 收到了来自inject script的信息(chrome/getUnreadCount.js):')
            // console.log(e)
            // console.log(e.data.data);
            // 将inject script拿到的数据发给popup展示
            chrome.runtime.sendMessage({unReadCount: e.data.data, window_id: winid});
        };
        }, 10000);


    let NEWEST = new Date().getTime();
    const targetNode = document.body;
    var callback = function () {
        const now = new Date().getTime();
        if (now - NEWEST > 5000) {
            NEWEST = now;
            try {
                chrome.runtime.sendMessage({update: true});

                // Blreay, get unreadcount，这种方法会导致丢消息，原因未知，可能和message机制有关系
                // now, use setInterval to register a callback function to run getUnreadCount.js
                /*
                console.log('zzy102: injectScript for getUnreadCount');
                injectScript(chrome.extension.getURL('chrome/getUnreadCount.js'), 'body');
                // fix bug: message is received multiple times
                // https://zhuanlan.zhihu.com/p/144330696?from_voters_page=true
                window.onmessage = function(e){
                    console.log('收到了来自inject script的信息:')
                    // console.log(e)
                    // console.log(e.data.data);
                    // 将inject script拿到的数据发给popup展示
                    chrome.runtime.sendMessage({unReadCount: e.data.data});
                };
                */

                // Blreay, getChatList，这种方法会导致丢消息，而且CPU占用率非常高，可能和传输的数据量太大有关系
                // 现在只有用户点击了popup窗口的时候，在App.js才发送这个消息给本js, 触发调用catchChatList.js
                /*
                console.log('zzy101: injectScript for catchChatList after update message');
                injectScript(chrome.extension.getURL('chrome/catchChatList.js'), 'body');
                window.addEventListener("message", function(e) {
                    console.log('收到了来自inject script的信息:')
                    // console.log(e.data.data);
                    // 将inject script拿到的数据发给popup展示
                    chrome.runtime.sendMessage({chatList: e.data.data});
                }, false);
                */

            } catch (e) {
                if (
                    e.message.match(/Invocation of form runtime\.connect/) &&
                    e.message.match(/doesn't match definition runtime\.connect/)
                ) {
                    console.error('Chrome extension, Actson has been reloaded. Please refresh the page');
                } else {
                    throw(e);
                }
            }
        }
    };

    const observer = new MutationObserver(callback);

    observer.observe(targetNode, { attributes: true, childList: true, subtree: true, characterData: true });
});

function injectScript(file_path, tag, params) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    script.onload = function() {
        if (document.getElementById('paramsContainer')) {
            // 先移除参数div
            this.parentNode.removeChild(document.getElementById('paramsContainer'));
        }
        // 执行完后移除掉
        this.parentNode.removeChild(this);
    };
    if (params) {
        var paramsContainer = document.createElement('div');
        paramsContainer.style.display = 'none';
        paramsContainer.setAttribute('id', 'paramsContainer');
        for(var key in params) {
            paramsContainer.setAttribute(key, params[key]);
        }
        node.appendChild(paramsContainer);
    }
    node.appendChild(script);
}

