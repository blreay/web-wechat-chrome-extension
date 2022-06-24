var wxList = window.angular.element(document.getElementsByClassName('chat_list')[0]).scope().chatList;
var data = {
    chatList: wxList
}
// send message to content script
console.log('zzy200: window.postMessage');
window.postMessage({"data": JSON.parse(JSON.stringify(data))}, '*');