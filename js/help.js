$("#urlfield").hide();

window.onload = function() { var htmlStyle = document.querySelector('html').style; chrome.windows.getCurrent(function(currentWindow) {  htmlStyle.width = (currentWindow.width*.25) + 'px'; console.log(htmlStyle.height, htmlStyle.width); }); };

