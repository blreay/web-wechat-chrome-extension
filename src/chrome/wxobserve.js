let resetTime = 60 * 1000 * 2;
let isLost = false;
let resetTimer = null;
let currentWinID = null;
let g_cur_winid = null;
let g_private_mode = false;
let g_win_active = false;
let g_blur_timer = null;

// currentWinID = window.id;
// console.log('zzy100: wxobserve.js is loaded, current_window_id=' + currentWinID);

/*
chrome.windows.getCurrent(function (currentWindow) {
    console.log('当前窗口ID：' + currentWindow.id);
    currentWinID = currentWindow.id;
});
*/

/**
 * Lightweight script to detect whether the browser is running in Private mode.
 * @returns {Promise<boolean>}
 *
 * Live demo:
 * @see https://output.jsbin.com/tazuwif
 *
 * This snippet uses Promises. If you want to run it in old browsers, polyfill it:
 * @see https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js
 *
 * More Promise Polyfills:
 * @see https://ourcodeworld.com/articles/read/316/top-5-best-javascript-promises-polyfills
 *
 * Disclaimer:
 * No longer maintained, last updated: Feb 2020
 */
function isPrivateMode() {
    return new Promise(function detect(resolve) {
        var yes = function () { resolve(true); }; // is in private mode
        var not = function () { resolve(false); }; // not in private mode

        function detectChromeOpera() {
            // https://developers.google.com/web/updates/2017/08/estimating-available-storage-space
            var isChromeOpera = /(?=.*(opera|chrome)).*/i.test(navigator.userAgent) && navigator.storage && navigator.storage.estimate;
            if (isChromeOpera) {
                navigator.storage.estimate().then(function (data) {
                    return data.quota < 120000000 ? yes() : not();
                });
            }
            return !!isChromeOpera;
        }

        function detectFirefox() {
            var isMozillaFirefox = 'MozAppearance' in document.documentElement.style;
            if (isMozillaFirefox) {
                if (indexedDB == null) yes();
                else {
                    var db = indexedDB.open('inPrivate');
                    db.onsuccess = not;
                    db.onerror = yes;
                }
            }
            return isMozillaFirefox;
        }

        function detectSafari() {
            var isSafari = navigator.userAgent.match(/Version\/([0-9\._]+).*Safari/);
            if (isSafari) {
                var testLocalStorage = function () {
                    try {
                        if (localStorage.length) not();
                        else {
                            localStorage.setItem('inPrivate', '0');
                            localStorage.removeItem('inPrivate');
                            not();
                        }
                    } catch (_) {
                        // Safari only enables cookie in private mode
                        // if cookie is disabled, then all client side storage is disabled
                        // if all client side storage is disabled, then there is no point
                        // in using private mode
                        navigator.cookieEnabled ? yes() : not();
                    }
                    return true;
                };

                var version = parseInt(isSafari[1], 10);
                if (version < 11) return testLocalStorage();
                try {
                    window.openDatabase(null, null, null, null);
                    not();
                } catch (_) {
                    yes();
                }
            }
            return !!isSafari;
        }

        function detectEdgeIE10() {
            var isEdgeIE10 = !window.indexedDB && (window.PointerEvent || window.MSPointerEvent);
            if (isEdgeIE10) yes();
            return !!isEdgeIE10;
        }

        // when a browser is detected, it runs tests for that browser
        // and skips pointless testing for other browsers.
        if (detectChromeOpera()) return;
        if (detectFirefox()) return;
        if (detectSafari()) return;
        if (detectEdgeIE10()) return;

        // default navigation mode
        return not();
    });
}

console.log("zzy601: wxobserve.js is inited");

document.addEventListener('DOMContentLoaded', function () {

    window.addEventListener('blur', function () {
        // focusLost reset chat item
        // isLost = true;
        // resetTimer = setTimeout(() => {
        //     injectScript(chrome.extension.getURL('chrome/blurPage.js'), 'body');
        // }, resetTime);
    });
    window.addEventListener('focus', function () {
        // if (resetTimer) {
        //     resetTimer = null;
        //     isLost = false;
        //     resetTime = 60 * 1000 * 2;
        // }
    });

    // popup通知content script才去拿数据
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.getChatList) {
            try {
                console.log('zzy100: injectScript for catchChatList');
                if (g_cur_winid) {
                } else {
                    g_cur_winid = document.getElementById('blreay_paramsContainer').getAttribute('blreay_winid');
                }
                g_private_mode = document.getElementById('blreay_paramsContainer').getAttribute('blreay_private');

                injectScript(chrome.extension.getURL('chrome/catchChatList.js'), 'body');
                // fix bug: message is received multiple times
                // https://zhuanlan.zhihu.com/p/144330696?from_voters_page=true
                // window.addEventListener("message", function(e) {
                window.onmessage = function (e) {
                    console.log('收到了来自inject script的信息(chrome/catchChatList.js):')
                    // console.log(e)
                    // console.log(e.data.data);
                    // 将inject script拿到的数据发给popup展示
                    chrome.runtime.sendMessage({ chatList: e.data.data, window_id: g_cur_winid, private: g_private_mode });
                };
                //}, false);
            } catch (e) {
                console.log("zzy109: exception occured: " + e.message)
                console.log(e);
                // chrome.extension.getBackgroundPage().broadcast_winid("aaa");
                chrome.runtime.sendMessage({ broadcast_winid: "aaa", window_id: 000, private: g_private_mode });
            }
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

    window.onblur = function (e) {
        console.log("未激活状态！blur");
        g_win_active = false;
        if (g_blur_timer) clearTimeout(g_blur_timer);
        g_blur_timer = setTimeout(function (e) {
            if (!g_win_active) {
                console.log('zzy103-1: injectScript for blur');
                injectScript(chrome.extension.getURL('chrome/blurPage.js'), 'body');
            }
        }, 1000 * 5); //5秒之後再自動設置blur
    }
    window.onfocus = function (e) {
        console.log("激活状态！")
        g_win_active = true;
    }

    //Blreay: 后台持续往前台发送未读信息数量，显示在右上角, 间隔10s
    //本来是持续发全部的chatlist, 但是发现很占CPU，而且运行一会儿内存不足异常退出。
    setInterval(function (e) {
        // 后台发送unread message count
        // console.log('zzy102: injectScript for chrome/getUnreadCount.js');
        try {
            if (g_cur_winid) {
            } else {
                g_cur_winid = document.getElementById('blreay_paramsContainer').getAttribute('blreay_winid');
                g_private_mode = document.getElementById('blreay_paramsContainer').getAttribute('blreay_private');
            }
            winid = g_cur_winid;
            console.log("zzy600: winid from blreay_paramsContainer.blreay_winid = " + g_cur_winid);
            injectScript(chrome.extension.getURL('chrome/getUnreadCount.js'), 'body');
            // fix bug: message is received multiple times
            // https://zhuanlan.zhihu.com/p/144330696?from_voters_page=true
            window.onmessage = function (e) {
                console.log('zzy100: 收到了来自inject script的信息(chrome/getUnreadCount.js):')
                // console.log(e)
                // console.log(e.data.data);
                // 将inject script拿到的数据发给popup展示
                chrome.runtime.sendMessage({ unReadCount: e.data.data, window_id: g_cur_winid, private: g_private_mode });
            };
        } catch (e) {
            console.log("zzy110: exception occured: " + e.message)
            console.log(e);
            // 请求background page广播winid
            // chrome.extension.getBackgroundPage().broadcast_winid("aaa");
            chrome.runtime.sendMessage({ broadcast_winid: "bbb", window_id: '000' });
        }
    }, 1000 * 10); // 10 second

    // setup a timer to keep wx active
    setInterval(function (e) {
        // if window is not actived, do something to keep wx online, wx2 will expired after a while
        if (!g_win_active) {
            console.log("zzy120: keep active, g_win_active=" + g_win_active);
            do_keep_active();
        }
    }, 1000 * 60); // 60s keepactive

    // Blreay: cannot work
    /*
    isPrivateMode().then(function (isPrivate) {
        g_private_mode = isPrivate;
        console.log('zzy111 Browsing in private mode? ', g_private_mode);
    });
    */

    let NEWEST = new Date().getTime();
    const targetNode = document.body;
    var callback = function () {
        const now = new Date().getTime();
        if (now - NEWEST > 5000) {
            NEWEST = now;
            try {
                chrome.runtime.sendMessage({ update: true });

                if (!g_cur_winid) {
                    chrome.runtime.sendMessage({ broadcast_winid: "ccc", window_id: '000' });
                }

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
                    throw (e);
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
    script.onload = function () {
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
        for (var key in params) {
            paramsContainer.setAttribute(key, params[key]);
        }
        node.appendChild(paramsContainer);
    }
    node.appendChild(script);
}

function do_keep_active() {
    console.log('zzy103: injectScript for keepActive');
    injectScript(chrome.extension.getURL('chrome/keepActive.js'), 'body');
    console.log('zzy103: injectScript for blur for keepactive');
    injectScript(chrome.extension.getURL('chrome/blurPage.js'), 'body');
}

