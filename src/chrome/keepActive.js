

// 点击“阅读”按钮，然后过2秒切回“聊天”页面
console.log('zzy620: keepactive go to reading page');
document.getElementsByClassName('tab_item')[1].getElementsByClassName('chat')[0].click();
setTimeout(function () {
    console.log('zzy620: keepactive goback to chat list page');
    document.getElementsByClassName('tab_item')[0].getElementsByClassName('chat')[0].click();
}, 2 * 1000);

// this is my first version, but sometimes it can not work. reason unknown
/*
var wxList = window.angular.element(document.getElementsByClassName('chat_list')[0]).scope().chatList;
var entries = wxList.entries() // 得到map对象的键值对迭代器。
var entryObj = entries.next() // entries.next()指向下一个键值对的对象。
while (true) {
    var entry = entryObj.value // entryObj是一个对象 {value:[key, value],done:false}。
    var key = entry[0] //value属性的值实际上是一个长度为2的数组[key, value]。
    var item = entry[1] //
    if (item.NoticeCount == 0 || (item.MMInChatroom && item.Statues == 0)) {
        var tabItem = document.getElementsByClassName('tab_item')[0];
        var chat = tabItem.getElementsByClassName('chat')[0];
        var chatItem = document.getElementsByClassName('chat_item')[0];
        var username = item.UserName;
        console.log("zzy502 begin click, username=" + username + '  nickname=' + item.NickName);

        chat.click();
        angular.element(chatItem).scope().itemClick(username);
        angular.element(chatItem).scope().$apply();
        break;
    } else {
        console.log("zzy504: " + item.NickName + " is ignored by zzy filter in keepActive,NoticeCount=" + item.NoticeCount);
        if (entryObj.done) {
            console.log("zzy505:  map is over, break, keepActive failed");
            break;
        }
        entryObj = entries.next()
    }
}
*/

// 登陆网页版微信时，一会儿不用就要重新扫码，重新登陆，这真是很恶心的事情，SO ,想了个办法，让它保持登陆状态，网上说只要一直用就不会掉，那好办呀：
// 在登陆页按F12打开谷歌调试工具，在控制台把这段代码粘进去：
/*
setInterval(function () {
    angular.element('pre:last').scope().editAreaCtn = "";
    angular.element('pre:last').scope().sendTextMessage();
}, 1 * 60 * 1000);
*/
//让微信间隔一分钟发送一条空消息，其实，空消息是发不出去的，不过，要的就是这个效果，保持使用状态。从此再也不担心微信掉线了。。
//转载于:https://www.cnblogs.com/rongyao/p/7097627.html


/*
// blur page
var chatItem = document.getElementsByClassName('chat_item')[0];
try {
    angular.element(chatItem).scope().itemClick('none');
} catch (e) {
    // console.log(e)
}
console.log("zzy503 blur page done");
*/