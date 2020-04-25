chrome.browserAction.setBadgeText({
    text: "Wait"
});

var type,
    priority,
    $currentNumberTickets,
    $currentNumberTask,
    $currentNumberTotal,
    $ticketNumberGlobal,
    $idleState,
    $rootURL,
    $queueData,
    $taskData,
    newStamp = 0,
    totalCount;
let lastPollAt;
let newList=[],oldList=[],difference=[];

let myStorage = window.localStorage;
if ($idleState == undefined) {
    $idleState = "active"
}
if ($currentNumberTickets == undefined) {
    $currentNumberTickets = 0
}
if ($currentNumberTask == undefined) {
    $currentNumberTask = 0
}
if ($currentNumberTotal == undefined) {
    $currentNumberTotal = 0
}

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        try{
            chrome.tabs.create({
                'url': 'chrome://extensions/?options=' + chrome.runtime.id
            });
        }
        catch(e){}
    }
    getSavedData();
});


function createAlarm(duration){
   

    chrome.alarms.create("CheckTicketsAlarm", {
        delayInMinutes: duration,
        periodInMinutes: duration
    });
}
createAlarm(1);

chrome.alarms.onAlarm.addListener(function(info, tab) {
    getSavedData();
});

function resetAlarm(duration){
    chrome.alarms.clear("CheckTicketsAlarm", function(){
        createAlarm(duration);
    }) 
}
function getSavedData() {
    chrome.storage.sync.get(['rooturl', 'secondary', 'primary', 'splitcount', 'disableAlarm', 'disablePoll', 'nonZeroCount', 'alarmOnNewEntry'], getQueues);
    //  chrome.storage.sync.get(null, function (data) { console.info(data) });

}

function audioNotification(){
    var mySound = new Audio('../sound/alarm-deep_groove.mp3');
    mySound.play();
}

function createNotification(){
    var opt = {type: "basic",title: "Your Title",message: "Your message",iconUrl: "your_icon.png"}
    chrome.notifications.create("notificationName",opt,function(){});

    //include this line if you want to clear the notification after 5 seconds
    setTimeout(function(){chrome.notifications.clear("notificationName",function(){});},5000);
}
function getlastPollAt() {
    return     myStorage.getItem('lastPollAt')
;
}

function getQueues(items) {
    if(items.disablePoll=="on"){
        oldList=[];
        difference=[];
        newList=[];
        return;
    }
    if(items.nonZeroCount == null && items.alarmOnNewEntry==null)
        items.nonZeroCount ="on";
    var primaryURL = changeURLforRESTAPI(items.primary),
        secondaryURL = changeURLforRESTAPI(items.secondary),
        count = 0;
        $rootURL = items.rooturl;
        newList=[];
    
    if (primaryURL != undefined && primaryURL != "") {
        count += 1
    }
    if (secondaryURL != undefined && secondaryURL != "") {
        count += 1
    }
    if (count > 0) {
        if (count == 1) {

            var data = getDataREST(primaryURL);
            
            totalCount = data['quantity'];
            if ($currentNumberTotal < totalCount) {
                $ticketNumberGlobal = data['number'];
                showNotification(data['number'], data['description'], data['severity'])
            }
            chrome.browserAction.setBadgeText({
                text: ((data['quantity'])).toString()
            });
            $currentNumberTotal = totalCount
                chrome.browserAction.setBadgeText({
                    text: (totalCount).toString()
                });

            // handle request for 1 field
        } else if (count == 2) {
            var data1 = getDataREST(primaryURL);
            var data2 = getDataREST(secondaryURL);
            totalCount = (data1['quantity'] + data2['quantity']);
            if ($currentNumberTotal < totalCount) {
                if (data1.timestamp > data2.timestamp) {
                    if (data1.timestamp > newStamp) {
                        newStamp = data1.timestamp;
                        $ticketNumberGlobal = data1['number'];
                        showNotification(data1['number'], data1['description'], data1['severity'])
                        if (items.splitcount == "true") {
                            chrome.browserAction.setBadgeText({
                                text: (data1['quantity']).toString() + " |" + (data2['quantity']).toString()
                            });
                        } else {
                            chrome.browserAction.setBadgeText({
                                text: ((data1['quantity']) + (data2['quantity'])).toString()
                            });
                        }
                    }
                } else {
                    if (data2.timestamp > newStamp) {
                        newStamp = data2.timestamp;
                        $ticketNumberGlobal = data2['number'];
                        showNotification(data2['number'], data2['description'], data2['severity'])

                    }
                }
            }
            if (items.splitcount == "true") {
                chrome.browserAction.setBadgeText({
                    text: (data1['quantity']).toString() + " |" + (data2['quantity']).toString()
                });
            } else {
                chrome.browserAction.setBadgeText({
                    text: (totalCount).toString()
                });
            }
            $currentNumberTotal = totalCount;
            
            //handle request for 2 fields
        }


        if (totalCount >0 && items.nonZeroCount=="on") {
            if(items.disableAlarm!="on")
                audioNotification();
        }
        else{
            difference = newList.filter(x => !oldList.includes(x));
            if(difference.length>0){
                if(items.disableAlarm!="on")
                    audioNotification();
            }
        }
        oldList=[]
        difference=[]
        oldList=oldList.concat(newList)
        myStorage.setItem('lastPollAt', new Date());
        
        
    }
}




function getDataREST(url) {
    var $BadgeCount
    var timestamps = [];
    var oldest = [];
    var dataOutput;
    $.ajax({
        type: "get",
        url: url,
        async: false,
        dataType: "json",
        success: function(data) {
            $queueData = $(data);
        },
        error: function(xhr, status) {
            chrome.browserAction.setBadgeText({
                text: "Err"
            });
        }
    })
    var $qTickets = $queueData[0].result.length;
    var max = 0;
    if ($qTickets > 0) {
        $queueData[0].result.forEach(function(record) {
            var $qticketNumber = record.number;
            newList.push($qticketNumber)
            if ($qticketNumber.indexOf("TASK") != -1) {
                var $qseverity = "10";
            } else if ($qticketNumber.indexOf("CHG") != -1) {
                var $qseverity = "15";
            } else {
                var $qseverity = record.priority;
            }
            var $qticketDescription = record.short_description;
            var time =record.sys_updated_on;
            var d1 = new Date(time);
            var qtime = parseInt(d1.getTime());
            var dataOutput1 = {
                "quantity": $qTickets,
                "number": $qticketNumber,
                "severity": $qseverity,
                "description": $qticketDescription,
                "timestamp": qtime
            }
            if (qtime > max) {
                max = qtime;
                dataOutput = dataOutput1;
                oldest.push(max);
            }
        })
    } else {
        var dataOutput1 = {
            "quantity": 0,
            "number": null,
            "severity": null,
            "description": null,
            "timestamp": 0
        }
        
        dataOutput = dataOutput1;

    }
    var output = Math.max(oldest);
    return dataOutput;
}





function showNotification(ticketNumber, ticketDescription, severity) {
    var imageName
    switch (severity) {
        case "1":
            imageName = "Sev1.png"
            break;
        case "2":
            imageName = "Sev2.png"
            break;
        case "3":
            imageName = "Sev3.png"
            break;
        case "4":
            imageName = "Sev4.png"
            break;
        case "10":
            imageName = "ServiceRequest.png"
            break;
        case "15":
            imageName = "change.png"
            break;
        default:
            imageName = "ITSM128.png"
    }
    chrome.notifications.create('reminder', {
        type: 'basic',
        iconUrl: 'images/' + imageName,
        title: ticketNumber,
        message: ticketDescription
    }, function(notificationId) {});
    

    //include this line if you want to clear the notification after 5 seconds
    setTimeout(function(){chrome.notifications.clear("reminder",function(){});},5000);
}


chrome.notifications.onClicked.addListener(notificationClicked);

function notificationClicked() {
	var urlTicketSearch;
	console.log($ticketNumberGlobal.substring(0,3));
	switch ($ticketNumberGlobal.substring(0,3)) {
			case "TAS":
					urlTicketSearch = $rootURL + "/sc_task.do?sys_id=" + $ticketNumberGlobal
					break;
			case "INC":
					urlTicketSearch = $rootURL + "/incident.do?sys_id=" + $ticketNumberGlobal
					break;
			case "CSP":
					urlTicketSearch = $rootURL + "/sn_customer_case.do?sys_id=" + $ticketNumberGlobal
					break;
			case "CSR":
					urlTicketSearch = $rootURL + "/sn_customer_case.do?sys_id=" + $ticketNumberGlobal
					break;
            case "REQ":
					urlTicketSearch = $rootURL + "/sc_request.do?sys_id=" + $ticketNumberGlobal
					break;
			case "CHG":
					urlTicketSearch = $rootURL + "/change_request.do?sys_id=" + $ticketNumberGlobal
					break;
			case "RIT":
					urlTicketSearch = $rootURL + "/sc_req_item.do?sys_id=" + $ticketNumberGlobal
					break;
			case "CAL":
					urlTicketSearch = $rootURL + "/new_call.do?sys_id=" + $ticketNumberGlobal
					break;
			default:
					urlTicketSearch = $rootURL + "/task_list.do?sysparm_query=numberLIKE" + $ticketNumberGlobal + "&sysparm_first_row=1&sysparm_view="
	}

	chrome.tabs.create({
	        'url': urlTicketSearch
	    })

}





function hasValue(item) {
    if ((item != undefined) && (item != NaN) && (item != null)) {
        return true
    }
    return false
}






function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}


function changeURLforRESTAPI(url) {

    if(url=="" || url==undefined)
        return undefined;
    // Created a URL object using URL() method 
    var parser = new URL(url); 
        
    // Protocol used in URL 
    let protocol=(parser.protocol); 
    
    // Host of the URL 
    let host=(parser.host); 
    
    // Port in the URL 
    let port=(parser.port); 
    
    // Hostname of the URL 
    let pathname=(parser.pathname) 

    // Search in the URL 
    let search=(parser.search); 
        
    /*
     * Note: Port will be included in host. So while joining back, dont include port
     */

    if(protocol!="")
        protocol=protocol+"//";
    pathname="/api/now/table"+pathname.replace("_list.do","");
    
    // Search parameter in the URL 
    let restURL=`${protocol}//${host}${pathname}${search}`;

    restURL=removeParam("sysparm_fields",restURL)
    restURL=removeParam("sysparm_view",restURL)
    restURL=restURL+"&sysparm_fields=number%2Cseverity%2Cshort_description%2Cpriority%2Csys_id%2Csys_updated_on";
    return restURL;
}


chrome.idle.onStateChanged.addListener(function(state) {
    $idleState = state
})
