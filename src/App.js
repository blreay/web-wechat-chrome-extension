import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Badge from 'material-ui/Badge';
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import './App.css';


class App extends Component {

    state = {
        hasOpenWx: false,
        isLogin: false,
        userInfo: null,
        g_obj: this,
        user1: null,
        users: new Map(),
        chatList: [] // 聊天列表
    }

    componentWillMount() {

        /*
                            request.chatList.window_id: {
                        chatList: request.chatList.chatList
                    }
                    */
        // 监听content script那边发送过来的数据（聊天列表、用户列表）
        chrome.runtime.onMessage.addListener((request) => {
            if (request.chatList) {
                console.log('zzy503: receive getchatlist message, window_id=' + request.window_id);

                /*
                this.setState(prevState => {
                    let newobj = Object.assign({}, prevState);  // creating copy of state variable jasper
                    newobj.name = 'someothername';                     // update the name property, assign a new value                 
                    return { newobj };                                 // return new object jasper object
                  })

                this.setState(prevState => {
                    let user1 = Object.assign({}, prevState.user1);  // creating copy of state variable jasper
                    user1.name = 'someothername';                     // update the name property, assign a new value                 
                    return { user1 };                                 // return new object jasper object
                  })

                // let aaa = "testvarname";
                this.setState({
                    aaa: request.chatList.chatList
                });
                this.setState({
                    chatList: request.chatList.chatList
                });
                
                this.setState({
                    users: new Map()
                });
                */

                /*
               var userobj = this.state.users.get(request.window_id);
               console.log('userobj=' + userobj);
               if (userobj == 'undefined') userobj = new Map();
               userobj.set('chatList', request.chatList.chatList);
               userobj.set('isLogin', true);
               this.setState(prevState => ({
                 users: prevState.users.set(request.window_id, userobj)
               }));
               */

                this.my_update_state(request.window_id, true, request.chatList.chatList, 'NO_CHANGE', 'NO_CHANGE');

                /*
                     this.setState(prevState => ({
                         users: prevState.users.set(request.window_id, request.chatList.chatList) 
                     }));
                     */
                console.log(this.state.users)
            }
        });

        //这里主要是为了与background建立连接，当页面关闭的时候连接就会断开，此时background中你注册的连接关闭函数此时会执行，因为background环境一直存在，除非你关闭了电脑
        var port = chrome.runtime.connect();

        /*
        var bg = chrome.extension.getBackgroundPage();
        var winid = bg.get_wx_winid();
        console.log("read winid from background.js: " + winid);

        // }, (wins) => {
        //    wins.forEach(win => {

        // chrome.windows.getAll({
            if(winid) {
        chrome.windows.get(winid, {
            populate: true,
            windowTypes: [ 'popup' ]
        }, (win) => {
            win.tabs.forEach(tab => {
                    console.log("zzy100: " + tab.url);
                    if (/https:\/\/wx.*\.qq\.com/ig.test(tab.url)) {
                        console.log("zzy00 matched" + tab.url);
                        this.setState({
                            hasOpenWx: true
                        });

                        // blreay, 主动获得chatlist
                        chrome.tabs.sendMessage(tab.id, {getChatList: true}, function(response){
                            console.log('message has send to wxobserve.js for getChatList')
                        });

                        setInterval(function(e){
                            // 后台持续刷新列表，使得可以自动重新render
                            chrome.tabs.sendMessage(tab.id, {getChatList: true}, function(response){
                                console.log('message has send to wxobserve.js for getChatList in timer')
                            });
                            }, 2000);

                        chrome.tabs.executeScript(tab.id, {
                            file: 'chrome/wxInfo.js'
                        }, res => {
                            let info = res[0];
                            if (!!info.avatar && !!info.nickname) { // 已登录，显示头像及昵称
                                this.setState({
                                    isLogin: true,
                                    userInfo: info
                                });
                                //blreay: set background to get new message
                                // 通知定时2秒进行清理
                                /*
                                setTimeout(function(e){
                                    // 这里的id只要和创建的时候设置id值一样就行了，就可以清理对应id的通知了
                                    chrome.notifications.clear("id");
                                }, 2000);
                                */ /*
} else {
this.setState({
isLogin: false
});
}
});
}
});
});
} else {
console.log("zzy111: no weixin window");
}
*/

        let that = this;
        let winid_set = chrome.extension.getBackgroundPage().get_wx_winid();
        console.log("get_wx_winid return: " + winid_set.keys());
        //winid_set.forEach(function (windowId) {
        // for(var windowId of winid_set) {
        for (var windowId of winid_set.keys()) {
            console.log("zzy01 windowId=" + windowId);

            that.check_win_id(windowId, that, function (tabid, obj) {
                console.log("zzy00 matched tabid=" + tabid + ' winid=' + windowId);
                /* obj.setState({
                    hasOpenWx: true
                }); */
                that.my_update_state(windowId, 'NO_CHANGE', 'NO_CHANGE', 'NO_CHANGE', true);

                // blreay, 主动获得chatlist
                chrome.tabs.sendMessage(tabid, { getChatList: true }, function (response) {
                    console.log('message has send to wxobserve.js for getChatList')
                });

                setInterval(function (e) {
                    // 后台持续刷新列表，使得可以自动重新render
                    chrome.tabs.sendMessage(tabid, { getChatList: true }, function (response) {
                        console.log('message has send to wxobserve.js for getChatList in timer')
                    });
                }, 2000);

                chrome.tabs.executeScript(tabid, {
                    file: 'chrome/wxInfo.js'
                }, res => {
                    let info = res[0];
                    console.log(info);
                    if (!!info.avatar && !!info.nickname) { // 已登录，显示头像及昵称
                        /*obj.setState({
                            isLogin: true,
                            userInfo: info
                        }); */
                        console.log("zzy700: set userinfo to " + info + "for window_id=" + windowId);
                        that.my_update_state(windowId, true, 'NO_CHANGE', info, 'NO_CHANGE');
                    } else {
                        /*obj.setState({
                            isLogin: false
                        });*/
                        console.log("zzy701: set userinfo to " + info + "for window_id=" + windowId);
                        that.my_update_state(windowId, false, 'NO_CHANGE', 'NO_CHANGE', 'NO_CHANGE');
                    }
                });
            }, function () {
                console.log("zzy111: no weixin window=" + windowId);
            })
        }
        //})

        if (this.state.users.size == 0) {
            this.my_update_state(9999, false, 'NO_CHANGE', 'NO_CHANGE', false);
            // isLogin = false;
        }

    }

    //Blreay: 实验结果显示：componentWillUnmount在chrome扩展的popup页面，是没有效果的。不会被调用到，改用新的方法：
    // https://www.jianshu.com/p/ff8c15e8d88e
    // 首先在你需要监听页面消失事件的js文件中与background建立连接，相关代码:
    // 在background环境注册断开连接时需要处理的方法，相关代码:
    /*
    componentWillUnmount()  {
        alert("will componentWillUnmount");
        console.log("will componentWillUnmount");
        // Blreay: send BlurPage message
        chrome.windows.getAll({
            populate: true
        }, (wins) => {
            wins.forEach(win => {
                win.tabs.forEach(tab => {
                    if (/wx2\.qq\.com/ig.test(tab.url)) {
                        this.setState({
                            hasOpenWx: true
                        });

                        chrome.tabs.sendMessage(tab.id, {blur: true}, function(response){
                            console.log('message has send to wxobserve.js for blurpage')
                        });
                    }
                });
            });
        });
    }
    */


    my_update_state = (winid, isLogin, chatList, userInfo, hasOpenWx) => {
        console.log('winid=' + winid + ' isLogin=' + isLogin + " chatList=" + chatList + ' userInfo=' + userInfo);
        console.log(this.state.users);
        let id = parseInt(winid);
        var userobj = this.state.users.get(id);
        if (typeof (userobj) == "undefined") {
            userobj = new Map();
            console.log('create new map object');
        }
        if (isLogin != 'NO_CHANGE') userobj.set('isLogin', isLogin);
        if (chatList != 'NO_CHANGE') userobj.set('chatList', chatList);
        if (userInfo != 'NO_CHANGE') userobj.set('userInfo', userInfo);
        if (hasOpenWx != 'NO_CHANGE') userobj.set('hasOpenWx', hasOpenWx);
        /*
        this.setState(prevState => ({
            users: prevState.users.set(winid, userobj)
        })); */

        let a = this.state.users;
        a.set(id, userobj);
        console.log("dump a ");
        console.log(a);
        this.setState({
            hasOpenWx: true
        });
        /*
        this.setState(prevState => {
            let old = Object.assign({}, prevState.users);  // creating copy of state variable jasper
            console.log('typeof old is ' + typeof(old));
            old.set(winid, userobj);
            console.log(old);
            return { old };
        })*/
        console.log("dump state ");
        console.log(this.state);
    }
    check_win_id = (winid, obj, ok_func, ng_func) => {
        try {
            chrome.windows.get(winid, {
                populate: true,
                windowTypes: ['popup']
            }, (win) => {
                if (chrome.runtime.lastError) {
                    // Something went wrong
                    console.warn("zzy502 Whoops.. " + chrome.runtime.lastError.message);
                    // Maybe explain that to the user too?
                    ng_func();
                } else {
                    // No errors, you can use entry
                    win.tabs.forEach(tab => {
                        console.log("zzy100 check_win_id url: " + tab.url);
                        if (/https:\/\/wx.*\.qq\.com/ig.test(tab.url)) {
                            console.log("zzy00 url matched: " + tab.url);
                            ok_func(tab.id, obj);
                        } else {
                            // tab.url可能是空的，刚刚创建完的window.
                            console.log("zzy00 url NOT matched: TODO, but still call ok_func() " + tab.url);
                            //ng_func();
                            ok_func(tab.id, obj);
                        }
                    });
                }
            });
        } catch (e) {
            console.error('Chrome extension, winid seems invalid:' + winid);
            console.log(e);
            ng_func();
        }
    }

    viewWx = (winid) => {
        // let windowId = chrome.extension.getBackgroundPage().get_wx_winid();
        let windowId = winid;
        let that = this;

        this.check_win_id(windowId, this, function (tabid, obj) {
            chrome.windows.update(windowId, { focused: true });
        }, function () {
            console.log("zzy130 create new window");
            let isPrivate = false;
            if (winid == 'private') { isPrivate = true; }
            chrome.windows.create({
                url: 'https://wx2.qq.com',
                type: 'popup',
                incognito: isPrivate,
                left: 300,
                focused: true
            }, function (w) {
                // w is the window object
                console.log(w);
                // notify background.js the new window's ID

                var bg = chrome.extension.getBackgroundPage();
                // bg.set_wx_winid(w.id); // 访问bg的函数

                that.check_win_id(w.id, that, function (tabid, obj) {

                    // w.tabs.forEach(tab => {
                    console.log("zzy100 check_win_id: " + w.id + " tabid: " + tabid);
                    bg.set_wx_winid(w.id, tabid);

                    // set winid to wx page
                    chrome.tabs.executeScript(tabid, {
                        code: " \
                                console.log('zzy500: im runned'); \
                                var tag='body'; \
                                var node = document.getElementsByTagName(tag)[0]; \
                                var paramsContainer = document.createElement('div'); \
                                paramsContainer.style.display = 'none'; \
                                paramsContainer.setAttribute('id', 'blreay_paramsContainer'); \
                                paramsContainer.setAttribute('blreay_winid', " + w.id + "); \
                                node.appendChild(paramsContainer); \
                                console.log('winid is set to: ' + document.getElementById('blreay_paramsContainer').getAttribute('blreay_winid')); \
                                "
                    }, res => {
                        let info = res[0];
                        console.log("zzy500-1: result: " + info);
                        console.log(info);
                    });

                }, function () {
                    console.log("window is not valid, error occured");
                })
            });

            //blreay: donnot close the popup win so that you can click the next msg convinently.
            //TODO: add option to control this behavior
            //window.close();
        }, function () {
            console.log("zzy501 window is not valid, error occured");
        });
    }
    //}

    activeChat = (winid, username) => {
        /*
        chrome.windows.getAll({
            populate: true
        }, (wins) => {
            wins.forEach(win => {
                win.tabs.forEach(tab => {
                    if (/https:\/\/wx.*\.qq\.com/ig.test(tab.url)) {
                        this.setState({
                            hasOpenWx: true
                        });

                        chrome.tabs.sendMessage(tab.id, {username: username}, function(response){
                            console.log('message has send to wxobserve.js for username')
                        });
                        this.viewWx();
                    }
                });
            });
        });
        */

        // let windowId = chrome.extension.getBackgroundPage().get_wx_winid();
        let windowId = winid;
        this.check_win_id(windowId, this, function (tabid, obj) {
            obj.setState({
                hasOpenWx: true
            });

            chrome.tabs.sendMessage(tabid, { username: username }, function (response) {
                console.log('message has send to wxobserve.js for username:' + username);
            });
            obj.viewWx(windowId);
        }, function () {
            console.log("winid invalid");
        })
    }

    loginout = () => {
        /*
        chrome.windows.getAll({
            populate: true
        }, (wins) => {
            wins.forEach(win => {
                win.tabs.forEach(tab => {
                    if (/https:\/\/wx.*\.qq\.com/ig.test(tab.url)) {
                        this.setState({
                            hasOpenWx: true
                        });

                        chrome.tabs.sendMessage(tab.id, {loginout: true}, function(response){
                            console.log('message has send to wxobserve.js')
                        });
                        window.close();
                    }
                });
            });
        });
        */

        let windowId = chrome.extension.getBackgroundPage().get_wx_winid();
        this.check_win_id(windowId, this, function (tabid, obj) {
            obj.setState({
                hasOpenWx: true
            });

            chrome.tabs.sendMessage(tabid, { loginout: true }, function (response) {
                console.log('message has send to wxobserve.js')
            });
            window.close();
        }, function () {
            console.log("winid invalid");
        })
    }

    _renderLogo = (winid) => {
        const isLogin = this.state.users.get(winid).get('isLogin');
        console.log('in _renderLogo, isLogin=' + isLogin);
        return (
            isLogin ? null : (
                <div className="wxLogo">
                    <img src={require('./img/wx.jpg')} alt='' style={{ width: '100%', verticalAlign: 'top' }} />
                </div>
            )
        )
    }

    _renderUserInfo = (winid) => {
        // const { isLogin, userInfo } = this.state;
        const isLogin = this.state.users.get(winid).get('isLogin');
        const userInfo = this.state.users.get(winid).get('userInfo');
        console.log('in _renderUserInfo, isLogin=' + isLogin + ' userInfo=' + userInfo);
        console.log(userInfo);
        return (
            (isLogin && !!userInfo) ? (
                <MuiThemeProvider>
                    <List>
                        <ListItem
                            disabled={true}
                            leftAvatar={
                                <Avatar src={userInfo.avatar} />
                            }
                        >
                            <div className="nickname" style={{ position: 'relative' }}>
                                {userInfo.nickname}
                                <span className="private" onClick={() => { this.viewWx('private') }}>New</span>
                                <span className="loginout" onClick={() => { this.viewWx(winid) }}>退出</span>
                            </div>
                        </ListItem>
                    </List>
                </MuiThemeProvider>
            ) : null
        )
    }

    _renderUnRead = () => {
        const { isLogin, userInfo } = this.state;
        if (!isLogin) {
            return null;
        } else {
            let readStr = '';
            if (!!userInfo && !userInfo.unreadCount) {
                readStr = '暂无未读消息';
            } else if (!!userInfo && userInfo.unreadCount <= 999) {
                readStr = `未读消息(${userInfo.unreadCount})`;
            } else if (!!userInfo && userInfo.unreadCount > 999) {
                readStr = '未读消息(999+)';
            }
            return (
                <div className="unread">
                    <span className="unread-num">{readStr}</span>
                    <span className="view" onClick={() => { this.viewWx('NO_VAL') }} style={{ 'display': userInfo.unreadCount ? 'inline-block' : 'none' }}>查看></span>
                </div>
            )
        }
    }

    _renderButton = (winid) => {
        // const { isLogin } = this.state;
        const isLogin = this.state.users.get(winid).get('isLogin');
        console.log('in _renderButton, isLogin=' + isLogin + ' userInfo=' + 'xxx');

        return (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, .4)' }}>
                <MuiThemeProvider>
                    <FlatButton label={isLogin ? '进入完整版' : '登录'}
                        fullWidth={true}
                        labelStyle={{ color: '#fff' }}
                        onClick={() => { this.viewWx(winid) }}
                    />
                </MuiThemeProvider>
            </div>
        )
    }

    _renderChatList = (winid) => {
        //const { isLogin, userInfo, chatList } = this.state;
        const isLogin = this.state.users.get(winid).get('isLogin');
        const userInfo = this.state.users.get(winid).get('userInfo');
        const chatList = this.state.users.get(winid).get('chatList');
        console.log('in _renderChatList, isLogin=' + isLogin + ' userInfo=' + userInfo + ' chatList=' + chatList);
        console.log(chatList);

        if (!isLogin) {
            return null;
        } else {
            if (typeof (chatList) == 'undefined' || !chatList.length) {
                return (
                    <MuiThemeProvider>
                        <div style={{ textAlign: 'center' }}>
                            <CircularProgress />
                            <div style={{ fontSize: '12px', paddingBottom: '10px' }}>未读消息列表获取中...</div>
                        </div>
                    </MuiThemeProvider>
                )
            }
            return (
                <MuiThemeProvider>
                    <List className="list">
                        {
                            /*
                            chatList.filter(function(item, idx) {
                                //
                                if (item.NoticeCount == 0 || (item.MMInChatroom && item.Statues == 0)) {
                                    // console.log( item.NickName + " is ignored by zzy filter");
                                    return false; // skip
                                }
                                return true;
                              }).map((item, idx) => {
                                */
                            // arrayObj = Array.from(chatList);
                            //arrayObj.sort(function(a,b) {return a.NoticeCount - b.NoticeCount});

                            chatList.map((item, idx) => {
                                // arrayObj.forEach((item,index) => {
                                return (
                                    <div key={idx}>
                                        <ListItem
                                            leftAvatar={
                                                !!item.NoticeCount != 0 ?
                                                    item.MMInChatroom && item.Statues == 0 ? (
                                                        <Badge
                                                            style={{ top: '-2px', left: '4px' }}
                                                            badgeContent={'zzy'}
                                                            secondary={true}
                                                            badgeStyle={{
                                                                top: 20,
                                                                right: 20,
                                                                width: '12px',
                                                                height: '12px',
                                                                fontSize: '10px',
                                                                backgroundColor: '#d44139'
                                                            }}
                                                        >
                                                            <Avatar src={'https://wx2.qq.com' + item.HeadImgUrl} />
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            style={{ top: '-2px', left: '4px' }}
                                                            badgeContent={item.NoticeCount}
                                                            secondary={true}
                                                            badgeStyle={{
                                                                width: 16,
                                                                height: 16,
                                                                top: 20,
                                                                right: 20,
                                                                backgroundColor: '#d44139'
                                                            }}
                                                        >
                                                            <Avatar src={'https://wx2.qq.com' + item.HeadImgUrl} />
                                                        </Badge>
                                                    )
                                                    : (
                                                        <Avatar src={'https://wx2.qq.com' + item.HeadImgUrl} />

                                                    )
                                            }
                                            primaryText={
                                                <div className="chatNickName">
                                                    {item.NickName}
                                                    {
                                                        !!item.MMDigestTime ? <span className="time">{item.MMDigestTime}</span> : null
                                                    }
                                                </div>
                                            }
                                            secondaryText={
                                                <p>
                                                    <span style={{ color: '#989898', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                        {!!item.NoticeCount && item.MMInChatroom && item.Statues == 0 ? `[${item.NoticeCount}条]${item.MMDigest}` : item.MMDigest}
                                                    </span>
                                                </p>
                                            }
                                            secondaryTextLines={1}
                                            onClick={() => {
                                                this.activeChat(winid, item.UserName);
                                                //new Notification("ChromePluginNotify",{icon:"images/30.png",body:"这是一个谷歌浏览器的通知"});
                                                /*
                                                chrome.notifications.create("id", {	
                                                    type : 'basic',
                                                    title : ' XXXXXXX ',  // 这里我故意使显示这个为空，显得没那么拥挤
                                                    message : 'Auto Recode Start · · ·',
                                                    iconUrl : 'images/30.png'
                                                });
                                                */
                                            }}
                                        />
                                        <Divider inset={true} style={{ backgroundColor: '#5f9ea0' }} />
                                    </div>
                                )
                            })
                        }
                    </List>
                </MuiThemeProvider>
            )
        }
    }
    /*
                {this._renderLogo()}
                {this._renderUserInfo()}
                {this._renderChatList()}
                {this._renderButton()}
                { this._renderUnRead()}

                {this._renderLogo()}
                {this._renderUserInfo()}
                {this._renderChatList()}
                {this._renderButton()} 

                */

    render() {
        //  const { isLogin } = this.state;
        var isLogin = true;
        var rows = [];
        console.log(this.state);
        console.log("size = " + this.state.users.size);
        if (this.state.users.has(9999)) {
            isLogin = false;
        }
        return (
            <div className="wrap">
                {
                    isLogin ? null : (<h2 className="title">欢迎使用微信网页版超级扩展</h2>)
                }


                {
                    this.state.users.forEach((v, k) => {
                        console.log("print user obj k=" + k);
                        console.log(v);
                        //return this._renderLogo(k) + this._renderUserInfo(k) + this._renderChatList(k) + this._renderButton(k);
                        rows.push(this._renderLogo(k));
                        rows.push(this._renderUserInfo(k));
                        rows.push(this._renderChatList(k));
                        rows.push(this._renderButton(k));
                    })

                    //rows.push(<h2 className="title">欢迎使用微信网页版超级扩展</h2>);

                }

                {this.state.users.delete(9999)}

                {rows}

            </div>
        );
    }
}

export default App;
