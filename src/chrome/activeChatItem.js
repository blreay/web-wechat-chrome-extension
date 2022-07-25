var tabItem = document.getElementsByClassName('tab_item')[0];
var chat = tabItem.getElementsByClassName('chat')[0];

// Blreay, sometimes the wrong conversation will be shown on wx window when i click the user name in popup userlist,
// by chrome dev tool, i found 'chat_item' scope has no itemClien() method
// BUt 'chat_list' has itemClick() method, don't know if this is the rootcause, change it and try
//var chatItem = document.getElementsByClassName('chat_item')[0];
var chatItem = document.getElementsByClassName('chat_list')[0];
var pd = document.getElementById('paramsContainer');
var username = pd.getAttribute('username');
console.log('zzy601: activeChatItem username=' + username);

//这个会导致点击用户名不能切换到正确的对话，如果曾经搜索过用户名并发消息，试一下
// 通过chrome dev tool发现的。观察堆栈发现这一行会异步的调用setusername(),
//chat.click();

angular.element(document.getElementsByClassName('chat_list')[0]).scope().itemClick(username);
angular.element(chatItem).scope().$apply();
