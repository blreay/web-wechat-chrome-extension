var wxList = window.angular.element(document.getElementsByClassName('chat_list')[0]).scope().chatList;

unread = 0;
wxList.forEach(function(item, idx){
    if (item.NoticeCount == 0 || (item.MMInChatroom && item.Statues == 0)) {
        // console.log("zzy01 ignore" + item.NickName);
    } else {
        unread += item.NoticeCount;
    }
　});
console.log("zzy301 unread = " + unread);

var data = {
    unReadCount: unread
}
// send message to content script
// console.log('zzy300: window.postMessage for unread');
window.postMessage({"data": JSON.parse(JSON.stringify(data))}, '*');