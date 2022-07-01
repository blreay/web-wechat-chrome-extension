import React, {Component} from 'react';
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
        chatList: [] // 聊天列表
    }


    componentWillMount()  {

        // 监听content script那边发送过来的数据（聊天列表、用户列表）
        chrome.runtime.onMessage.addListener((request) => {
            if (request.chatList) {
                this.setState({
                    chatList: request.chatList.chatList
                });
                console.log(this.state.chatList)
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

        let windowId = chrome.extension.getBackgroundPage().get_wx_winid();
        this.check_win_id(windowId, this, function(tabid, obj){
            console.log("zzy00 matched" + tabid);
            obj.setState({
                hasOpenWx: true
            });

            // blreay, 主动获得chatlist
            chrome.tabs.sendMessage(tabid, {getChatList: true}, function(response){
                console.log('message has send to wxobserve.js for getChatList')
            });

            setInterval(function(e){
                // 后台持续刷新列表，使得可以自动重新render
                chrome.tabs.sendMessage(tabid, {getChatList: true}, function(response){
                    console.log('message has send to wxobserve.js for getChatList in timer')
                });
             }, 2000);

            chrome.tabs.executeScript(tabid, {
                file: 'chrome/wxInfo.js'
            }, res => {
                let info = res[0];
                if (!!info.avatar && !!info.nickname) { // 已登录，显示头像及昵称
                    obj.setState({
                        isLogin: true,
                        userInfo: info
                    });
                } else {
                    obj.setState({
                        isLogin: false
                    });
                }
            });
        }, function(){
            console.log("zzy111: no weixin window");
        })
        //});
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

    /*
    sleep = (ms) =>{
        var start=Date.now(),end = start+ms;
        while(Date.now() < end);
        return;
     }

     sleep2 = (timeout) => {
        return new Promise((resolve)=>{
          setTimeout(()=>{
            resolve();
          }, timeout)
        })
      }
      */

    check_win_id = (winid, obj, ok_func, ng_func) => {
        try{
            chrome.windows.get(winid, {
                populate: true,
                windowTypes: [ 'popup' ]
            }, (win) => {
                win.tabs.forEach(tab => {
                    // console.log("zzy100 check_win_id: " + tab.url);
                    if (/https:\/\/wx.*\.qq\.com/ig.test(tab.url)) {
                        console.log("zzy00 url matched: " + tab.url);
                        ok_func(tab.id, obj);
                    } else {
                        ng_func();
                    }
                });
            });
        } catch(e) {
            console.error('Chrome extension, winid seems invalid:' + winid);
            console.log(e);
            ng_func();
        }
    }

    viewWx = () => {
        /*
        let windowId = null;
        chrome.windows.getAll({
            populate: true
        }, function (windows) {
            windows.forEach(function (win) {
                if (win.tabs.length) {
                    win.tabs.forEach(function (tab) {
                        if (/https:\/\/wx.*\.qq\.com/ig.test(tab.url)) {
                            windowId = tab.windowId;
                        }
                    });
                }
            });
            */
            /*
            var winIsValid = false;

            chrome.windows.get(winid, {
                populate: true,
                windowTypes: [ 'popup' ]
            }, (win) => {
                win.tabs.forEach(tab => {
                        console.log("zzy100: " + tab.url);
                        if (/https:\/\/wx.*\.qq\.com/ig.test(tab.url)) {
                            winIsValid = true;
                            console.log("zzy00 matched" + tab.url);
                        }
                    });
                });
                */

            let windowId = chrome.extension.getBackgroundPage().get_wx_winid();
            this.check_win_id(windowId, this, function(tabid, obj){
                chrome.windows.update(windowId, {focused: true});
            }, function(){
                chrome.windows.create({
                    url: 'https://wx2.qq.com',
                    type: 'popup',
                    focused: true
                }, function (w) {
                    // w is the window object
                    console.log(w);
                    // notify background.js the new window's ID

                    var bg = chrome.extension.getBackgroundPage();
                    bg.set_wx_winid(w.id); // 访问bg的函数

                    //blreay: donnot close the popup win so that you can click the next msg convinently.
                    //TODO: add option to control this behavior
                    //window.close();
                });
            })
            /*
            if (this.check_win_id(winid)) {
                chrome.windows.update(windowId, {focused: true});
                //blreay: donnot close the popup win so that you can click the next msg convinently.
                //TODO: add option to control this behavior
                //window.close();
            } else {
                chrome.windows.create({
                    url: 'https://wx2.qq.com',
                    type: 'popup',
                    focused: true
                }, function (w) {
                    // w is the window object
                    console.log(w);
                    // notify background.js the new window's ID

                    var bg = chrome.extension.getBackgroundPage();
                    bg.set_wx_winid(w.id); // 访问bg的函数

                    //blreay: donnot close the popup win so that you can click the next msg convinently.
                    //TODO: add option to control this behavior
                    //window.close();
                });
            } */
        // });
    }

    activeChat = (username) => {
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

        let windowId = chrome.extension.getBackgroundPage().get_wx_winid();
        this.check_win_id(windowId, this, function(tabid, obj){
            obj.setState({
                hasOpenWx: true
            });

            chrome.tabs.sendMessage(tabid, {username: username}, function(response){
                console.log('message has send to wxobserve.js for username')
            });
            obj.viewWx();
        }, function(){
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
        this.check_win_id(windowId, this, function(tabid, obj){
            obj.setState({
                hasOpenWx: true
            });

            chrome.tabs.sendMessage(tabid, {loginout: true}, function(response){
                console.log('message has send to wxobserve.js')
            });
            window.close();
        }, function(){
            console.log("winid invalid");
        })
    }

    _renderLogo = () => {
        const {isLogin} = this.state;
        return (
            isLogin ? null : (
                <div className="wxLogo">
                    <img src={ require('./img/wx.jpg') } alt='' style={{width: '100%', verticalAlign: 'top'}}/>
                </div>
            )
        )
    }

    _renderUserInfo = () => {
        const {isLogin, userInfo} = this.state;
        return (
            (isLogin && !!userInfo) ? (
                <MuiThemeProvider>
                    <List>
                        <ListItem
                            disabled={true}
                            leftAvatar={
                                <Avatar src={ userInfo.avatar } />
                            }
                        >
                            <div className="nickname" style={{ position: 'relative' }}>
                                { userInfo.nickname }
                                <span className="loginout" onClick={this.loginout}>退出</span>
                            </div>
                        </ListItem>
                    </List>
                </MuiThemeProvider>
            ) : null
        )
    }

    _renderUnRead = () => {
        const {isLogin, userInfo} = this.state;
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
                    <span className="unread-num">{ readStr }</span>
                    <span className="view" onClick={this.viewWx} style={{ 'display': userInfo.unreadCount ? 'inline-block' : 'none' }}>查看></span>
                </div>
            )
        }
    }

    _renderButton = () => {
        const { isLogin } = this.state;
        return (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, .4)' }}>
                <MuiThemeProvider>
                    <FlatButton label={ isLogin ? '进入完整版' : '登录' }
                                fullWidth={true}
                                labelStyle={{ color: '#fff' }}
                                onClick={this.viewWx}
                    />
                </MuiThemeProvider>
            </div>
        )
    }

    _renderChatList = () => {
        const {isLogin, userInfo, chatList} = this.state;
        if (!isLogin) {
            return null;
        } else {
            /*
            while(!chatList.length) {
                this.sleep2(1);
                console.log("zzy500: sleep to wait data");
            };
            */

            if (!chatList.length) {
                return (
                    <MuiThemeProvider>
                        <div style={{textAlign: 'center'}}>
                            <CircularProgress />
                            <div style={{fontSize: '12px', paddingBottom: '10px'}}>未读消息列表获取中...</div>
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
                                                    { item.NickName }
                                                    {
                                                        !!item.MMDigestTime ? <span className="time">{ item.MMDigestTime }</span> : null
                                                    }
                                                </div>
                                            }
                                            secondaryText={
                                                <p>
                                                    <span style={{color: '#989898', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block'}}>
                                                        {!!item.NoticeCount && item.MMInChatroom && item.Statues == 0 ? `[${item.NoticeCount}条]${item.MMDigest}` : item.MMDigest}
                                                    </span>
                                                </p>
                                            }
                                            secondaryTextLines={1}
                                            onClick={() => {
                                                this.activeChat(item.UserName);
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
                                        <Divider inset={true} style={{backgroundColor: '#292c33'}} />
                                    </div>
                                )
                            })
                        }
                    </List>
                </MuiThemeProvider>
            )
        }
    }

    render () {
        const { isLogin } = this.state;
        return (
            <div className="wrap">
                {
                    isLogin ? null : (<h2 className="title">欢迎使用微信网页版超级扩展</h2>)
                }

                { this._renderLogo() }
                { this._renderUserInfo() }
                { this._renderChatList() }
                { this._renderButton() }
                { /* this._renderUnRead() */}
            </div>
        );
    }
}

export default App;
