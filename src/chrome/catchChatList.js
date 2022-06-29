var wxList = window.angular.element(document.getElementsByClassName('chat_list')[0]).scope().chatList;

var wxList2 = wxList.filter(function(item, idx) {
    //Blreay: 只返回未读消息的列表，设置为免打扰的也不返回
    if (item.NoticeCount == 0 || (item.MMInChatroom && item.Statues == 0)) {
        // console.log( item.NickName + " is ignored by zzy filter");
        return false; // skip
    }
    return true;
  });

var data = {
    chatList: wxList2
}
// send message to content script
console.log('zzy200: window.postMessage for chatList');
console.log(data);
window.postMessage({"data": JSON.parse(JSON.stringify(data))}, '*');