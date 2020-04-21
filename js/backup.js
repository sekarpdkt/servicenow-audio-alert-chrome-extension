$("#urlfield").hide();
$("#clear").hide();

function getRootURL(searchunacceptedurl) {
    index = searchunacceptedurl.indexOf("/", 10)
    return searchunacceptedurl.slice(0, index)
}

// Saves options to chrome.storage
function save_options() {
    var url = $("#idurl").val()
    var rooturl = $("#idrooturl").val()
    var searchunacceptedurl = $("#idunacceptedcalls").val()

    var $followWorkflow
    if ($("#followWorkflow").is(":checked")) {
        $followWorkflow = true
    } else {
        $followWorkflow = false
    }

    console.log("followWorkflow ", $followWorkflow)

    if (isEmpty(rooturl) && isEmpty(searchunacceptedurl)) {
        rooturl = "https://aomev.service-now.com"
    } else if (!(isEmpty(searchunacceptedurl))) {
        rooturl = getRootURL(searchunacceptedurl)
    }

    chrome.storage.sync.set({
        'specificURL': url,
        'rootURL': rooturl,
        'searchunacceptedurl': searchunacceptedurl,
        'followWorkflow': $followWorkflow
    }, function() {
        showSuccessMessage("Options saved!")
    });
}

function isEmpty(value) {
    if (value == undefined || value == "" || value == null || value == NaN) {
        return true
    }
    return false
}

function showSuccessMessage(message) {
    var status = document.getElementById('status');
    status.textContent = message;
    showMessageForWhile(3000)
}

function showMessageForWhile(millisec) {
    $("#status").show();
    setTimeout(function() {
        $("#status").hide();
        status.textContent = '';
    }, millisec);
}

function showMessageForMillisec(millisec) {
    $("#status").show();
    setTimeout(function() {
        $("#status").hide();
        status.textContent = '';
    }, millisec);
}

function clear_options() {
    chrome.storage.sync.clear();

    var status = document.getElementById('status');
    status.textContent = 'Options erased';
    $("#status").show();
    setTimeout(function() {
        $("#status").hide();
        status.textContent = '';
    }, 3000);
}

function restore_options() {
    chrome.storage.sync.get(['specificURL', 'rootURL', 'searchunacceptedurl', 'followWorkflow'], function(items) {
        $("#idunacceptedcalls").val(items.searchunacceptedurl);
        $("#idurl").val(items.specificURL);
        if (items.rootURL != undefined) {
            $("#idrooturl").val(items.rootURL);
        } else {
            $("#idrooturl").val("https://aomev.service-now.com");
        }
        if (isEmpty($("#idunacceptedcalls").val())) {
            $("#idunacceptedcalls").prop('readonly', true);
            $("#idrooturl").prop('readonly', false);
        } else {
            $("#idunacceptedcalls").prop('readonly', false);
            $("#idrooturl").prop('readonly', true);
        }
        if (items.followWorkflow != undefined) {
            console.log("items.followWorkflow RECOVER", items.followWorkflow)
            $("#followWorkflow").prop("checked", items.followWorkflow);
        } else {
            $("#followWorkflow").prop("checked", false);
            console.log("UNDEFINED")
        }
    });
}

$(document).ready(function() {
    $("#status").hide()
    restore_options()

    $("#searchpage").change(function() {
        var notifications
        if ($(this).is(":checked")) {
            $("#idurl").val("")
            $("#idurl").prop('disabled', true);
        } else {
            $("#idurl").prop('disabled', false);
        }
    });

    $("#followWorkflow").change(function() {
        if ($(this).is(":checked")) {
            $("#idurl").val("")
            $("#idurl").prop('disabled', true);
        } else {
            $("#idurl").prop('disabled', false);
        }
    });

    $("#idrooturl").click(function() {
        $("#idunacceptedcalls").prop('readonly', true);
        $("#idunacceptedcalls").val("")
        $("#idrooturl").prop('readonly', false);
    })

    $("#idunacceptedcalls").click(function() {
        $("#idrooturl").prop('readonly', true);
        $("#idunacceptedcalls").prop('readonly', false);
    })

    $("#idunacceptedcalls").keyup(function(event) {
        if (event.keyCode == 13) {
            $("#save").click();
        }
    })
    $("#idrooturl").keyup(function(event) {
        if (event.keyCode == 13) {
            $("#save").click();
        }
    })
    $("#idurl").keyup(function(event) {
        if (event.keyCode == 13) {
            $("#save").click();
        }
    })
});

document.getElementById('save').addEventListener('click', save_options);
//document.getElementById('clear').addEventListener('click',clear_options);



/////////////////////////////////////////////////////////////////////////////////////////////////////////


chrome.browserAction.setBadgeText({
    text: "Wait"
});
var $currentNumberTickets
var $currentNumberWorkflows
var $currentNumberTotal
var $ticketNumberGlobal
var $idleState
var $rootURL

if ($rootURL == undefined) {
    $rootURL = "https://aomev.service-now.com"
}
if ($idleState == undefined) {
    $idleState = "active"
}
if ($currentNumberTickets == undefined) {
    $currentNumberTickets = 0
}
if ($currentNumberWorkflows == undefined) {
    $currentNumberWorkflows = 0
}
if ($currentNumberTotal == undefined) {
    $currentNumberTotal = 0
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
        default:
            imageName = "ITSM128.png"
    }
    chrome.notifications.create('reminder', {
        type: 'basic',
        iconUrl: 'images/' + imageName,
        title: ticketNumber,
        message: ticketDescription
    }, function(notificationId) {});
}

chrome.notifications.onClicked.addListener(notificationClicked);

function notificationClicked() {
    var urlTicketSearch = $rootURL + "/incident.do?sys_id=" + $ticketNumberGlobal
    chrome.tabs.create({
        'url': urlTicketSearch
    })
}

chrome.alarms.create("CheckTicketsAlarm", {
    delayInMinutes: 1,
    periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener(function(info, tab) {
    getGroupsSaved()
});

function getAssignmentGroupById(AGroupId) {
    var $group = ""
    $(function() {
        $.ajax({
            type: "get",
            url: $rootURL + "/sys_user_group.do?XML&sys_id=" + AGroupId,
            dataType: "xml",
            async: false,
            success: function(data) {
                var $allxml = $(data)
                $group = $allxml.find("sys_user_group").find("name").text()
            },
            error: function(xhr, status) {
                $group = "error"
            }
        });
    });
    return $group
}

function getGroupsSaved() {
    chrome.storage.sync.get(['groups', 'specificURL', 'rootURL', 'searchunacceptedurl', 'followWorkflow'], loadPendingTasks);
}

function removeOtherGroups(xml, groups) {
    $.each($(xml).find("incident"), function(index, value) {
        var $ticketAGroupId = $(value).find("assignment_group")
        var ticketAGroup = getAssignmentGroupById($ticketAGroupId.text())
        tag = ticketAGroup.toLowerCase()
        g = groups.toLowerCase()
        if (tag.indexOf(g) == -1) {
            $(this).remove();
        }
    })

    return xml
}

function hasValue(item) {
    if ((item != undefined) && (item != NaN) && (item != null)) {
        return true
    }
    return false
}

function loadTickesFromSearchURL(items) {
    var searchURL = changeURLforGetXML(items.searchunacceptedurl)
    $.ajax({
        type: "get",
        url: searchURL,
        async: false,
        dataType: "xml",
        success: function(data) {
            var $allxml = $(data)
            var group = items.groups
            if (hasValue(group) && group != "") {
                group = group.replace("#", "")
                $allxml = removeOtherGroups($allxml, group)
            }
            var $quantTickets = $allxml.find("incident").length
            chrome.browserAction.setBadgeText({
                text: $quantTickets.toString()
            });
            var $ticketNumber = $allxml.find("incident").last().find("number")
            var $severity = $allxml.find("incident").last().find("severity")
            var $ticketDescription = $allxml.find("incident").last().find("short_description")
            var $numberUpdated = $quantTickets
            var $ticketAGroupId = $allxml.find("incident").last().find("assignment_group")
            var $ticketAGroup = getAssignmentGroupById($ticketAGroupId.text())

            if (hasValue($currentNumberTickets) && ($quantTickets > $currentNumberTickets) && ($quantTickets > 0)) {
                $ticketNumberGlobal = $ticketNumber.text()
                showNotification($ticketNumber.text(), $ticketDescription.text(), $severity.text())
            }
            $currentNumberTickets = $quantTickets
        },
        error: function(xhr, status) {
            chrome.browserAction.setBadgeText({
                text: "X"
            });
        }
    })
}

function loadTicketsFromRootURL(items) {
    if (items.rootURL != undefined) {
        $rootURL = items.rootURL
    }
    $.ajax({
        type: "get",
        url: $rootURL + "/incident_list.do?XML&sysparm_query=incident_state=3^assignment_group=javascript:gs.getUser().getMyGroups()^%3B%5EORDERBYsys_updated_on&sysparm_view=",
        async: false,
        dataType: "xml",
        success: function(data) {
            var $allxml = $(data)
            var group = items.groups
            if (hasValue(group) && group != "") {
                group = group.replace("#", "")
                $allxml = removeOtherGroups($allxml, group)
            }
            var $quantTickets = $allxml.find("incident").length
            chrome.browserAction.setBadgeText({
                text: $quantTickets.toString()
            });
            var $ticketNumber = $allxml.find("incident").last().find("number")
            var $ticketDescription = $allxml.find("incident").last().find("short_description")
            var $numberUpdated = $quantTickets
            var $severity = $allxml.find("incident").last().find("severity")
            var $ticketAGroupId = $allxml.find("incident").last().find("assignment_group")
            var $ticketAGroup = getAssignmentGroupById($ticketAGroupId.text())

            if (hasValue($currentNumberTickets) && ($numberUpdated > $currentNumberTickets) && ($numberUpdated > 0)) {
                $ticketNumberGlobal = $ticketNumber.text()
                showNotification($ticketNumber.text(), $ticketDescription.text(), $severity.text())
            }
            $currentNumberTickets = $numberUpdated
        },
        error: function(xhr, status) {
            chrome.browserAction.setBadgeText({
                text: "X"
            });
        }
    })
}

function loadWorkflowsFromRootURL(items) {
    if (items.rootURL != undefined) {
        $rootURL = items.rootURL
    }
    $.ajax({
        type: "get",
        url: $rootURL + "/u_inc_wftask_list.do?XML&sysparm_query=iwt_u_assigned_group%3Djavascript%3AgetMyGroupsAdvanced2(4)%5Eiwt_u_assigned_group%3Dd2c17b14e9082d007e9753d310d3051b%5Eiwt_u_task_status%3D1%5EORDERBYinc_u_updated_by_customer&sysparm_view=",
        async: false,
        dataType: "xml",
        success: function(data) {
            var $allxml = $(data)
            var $quantWorkflows = $allxml.find("u_inc_wftask").length
            console.log("quantWorkflows " + $quantWorkflows)
            $totalPending = $quantWorkflows + $currentNumberTickets
            console.log("$totalPending " + $totalPending)
            chrome.browserAction.setBadgeText({
                text: $quantWorkflows.toString() + "-" + $currentNumberTickets
            });
            var $WFNumber = $allxml.find("u_inc_wftask").last().find("inc_number")
            var $WFDescription = $allxml.find("u_inc_wftask").last().find("inc_short_description")
            var $numberUpdated = $quantWorkflows

            if (hasValue($currentNumberTickets) && ($quantWorkflows > $currentNumberWorkflows) && ($quantWorkflows > 0)) {
                $ticketNumberGlobal = $WFNumber.text()
                showNotification($WFNumber.text(), $WFDescription.text())
            }
            $currentNumberWorkflows = $quantWorkflows
            $currentNumberTotal = $currentNumberWorkflows + $currentNumberTickets
        },
        error: function(xhr, status) {
            chrome.browserAction.setBadgeText({
                text: "X"
            });
        }
    })
}

function changeURLforGetXML(url) {
    index = url.indexOf("?")
    return url.slice(0, index + 1) + "XML&" + url.slice(index + 1, url.length)
}

function loadFromLink(items) {
    urlXML = changeURLforGetXML(items.specificURL)
    $.ajax({
        type: "get",
        url: urlXML,
        dataType: "xml",
        async: false,
        success: function(data) {
            var $allxml = $(data)
            var $quantTask = $allxml.find("incident").length

            if ($allxml.find("incident").length > 0) {
                $quantTask = $allxml.find("incident").length
            } else if ($allxml.find("u_interruption_of_service").length > 0) {
                $quantTask = $allxml.find("u_interruption_of_service").length
            } else if ($allxml.find("problem").length > 0) {
                $quantTask = $allxml.find("problem").length
            } else if ($allxml.find("change_request").length > 0) {
                $quantTask = $allxml.find("change_request").length
            }

            var badgeText = $quantTask.toString() + "  " + $currentNumberTickets.toString()
            chrome.browserAction.setBadgeText({
                text: badgeText
            });
            var $ticketNumber = $allxml.find("incident").last().find("number")
            var $ticketDescription = $allxml.find("incident").last().find("short_description")
            var $numberUpdated = $quantTask

            if (hasValue($currentNumberTasks) && ($numberUpdated > $currentNumberTasks) && ($numberUpdated > 0)) {
                $ticketNumberGlobal = $ticketNumber.text()
                showNotification($ticketNumber.text(), $ticketDescription.text())
            }
            $$currentNumberTasks = $numberUpdated
        },
        error: function(xhr, status) {
            chrome.browserAction.setBadgeText({
                text: "X X"
            });
        }
    })
}

function loadPendingTasks(items) {
    if ($idleState != "locked") {
        if (items.searchunacceptedurl != undefined && items.searchunacceptedurl != "") {
            loadTickesFromSearchURL(items)
        } else {
            loadTicketsFromRootURL(items)
        }
        console.log("Checking follow workflow.....", items.followWorkflow)
        if (items.followWorkflow) {
            console.log("Follow Workflow")
            loadWorkflowsFromRootURL(items)
        } else if (hasValue(items.specificURL) && items.specificURL != "") {
            loadFromLink(items)
        }
    }
}

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        chrome.tabs.create({
            'url': 'chrome://extensions/?options=' + chrome.runtime.id
        });
    }
    getGroupsSaved()
});

chrome.idle.onStateChanged.addListener(function(state) {
    $idleState = state
})




////////////////////////////////////////////////////////////////////////////
chrome.browserAction.setBadgeText({
    text: "Wait"
});

var $currentNumberTickets
var $currentNumberTask
var $currentNumberTotal
var $ticketNumberGlobal
var $idleState
var $rootURL
var $queueCount = 0;
var $taskCount = 0;
var $queueData;
var $taskData;

if ($rootURL == undefined) {
    $rootURL = "https://chs.service-now.com"
}
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
        default:
            imageName = "ITSM128.png"
    }
    chrome.notifications.create('reminder', {
        type: 'basic',
        iconUrl: 'images/' + imageName,
        title: ticketNumber,
        message: ticketDescription
    }, function(notificationId) {});
}


// function showNotification1(ticketNumber,ticketDescription,severity) {
// 	var imageName
// 	switch(severity) {
// 		default:
// 			imageName = "ServiceRequest.png"
// 	}
//     chrome.notifications.create('reminder', {
//         type: 'basic',
//         iconUrl: 'images/' + imageName,
//         title: ticketNumber,
//         message: ticketDescription
//      }, function(notificationId) {});
// }

chrome.notifications.onClicked.addListener(notificationClicked);

function notificationClicked() {
    var urlTicketSearch = $rootURL + "/incident.do?sys_id=" + $ticketNumberGlobal
    chrome.tabs.create({
        'url': urlTicketSearch
    })
}

chrome.alarms.create("CheckTicketsAlarm", {
    delayInMinutes: 1,
    periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener(function(info, tab) {
    getGroupsSaved()
});

function getAssignmentGroupById(AGroupId) {
    var $group = ""
    $(function() {
        $.ajax({
            type: "get",
            url: $rootURL + "/sys_user_group.do?XML&sys_id=" + AGroupId,
            dataType: "xml",
            async: false,
            success: function(data) {
                var $allxml = $(data)
                $group = $allxml.find("sys_user_group").find("name").text()
            },
            error: function(xhr, status) {
                $group = "error"
            }
        });
    });
    return $group
}

function getGroupsSaved() {
    chrome.storage.sync.get(['rootURL', 'task', 'unassigned'], loadPendingTasks);
}

function removeOtherGroups(xml, groups) {
    $.each($(xml).find("incident"), function(index, value) {
        var $ticketAGroupId = $(value).find("assignment_group")
        var ticketAGroup = getAssignmentGroupById($ticketAGroupId.text())
        tag = ticketAGroup.toLowerCase()
        g = groups.toLowerCase()
        if (tag.indexOf(g) == -1) {
            $(this).remove();
        }
    })

    return xml
}

function hasValue(item) {
    if ((item != undefined) && (item != NaN) && (item != null)) {
        return true
    }
    return false
}

function loadTickesFromSearchURL(items) {
    var BadgeCount;
    var searchURL = changeURLforGetXML(items.unassigned)
    var searchTaskURL = changeURLforGetXML(items.task)
    $.ajax({
        type: "get",
        url: searchURL,
        async: false,
        dataType: "xml",
        success: function(data) {
            var $allxml = $(data)
            var group = items.groups
            if (hasValue(group) && group != "") {
                group = group.replace("#", "")
                $allxml = removeOtherGroups($allxml, group)
            }
            var $quantTickets = $allxml.find("incident").length
            BadgeCount = $quantTickets;
            //chrome.browserAction.setBadgeText({text: ($queueCount + $taskCount).toString()});
            var $ticketNumber = $allxml.find("incident").last().find("number")
            var $severity = $allxml.find("incident").last().find("severity")
            var $ticketDescription = $allxml.find("incident").last().find("short_description")
            var $numberUpdated = $quantTickets
            var $ticketAGroupId = $allxml.find("incident").last().find("assignment_group")
            var $ticketAGroup = getAssignmentGroupById($ticketAGroupId.text())

            // if (hasValue($currentNumberTickets) && ($quantTickets > $currentNumberTickets) && ($quantTickets > 0)) {
            // 	$ticketNumberGlobal = $ticketNumber.text()
            // 	showNotification($ticketNumber.text(),$ticketDescription.text(), $severity.text())
            // }
            $currentNumberTickets = BadgeCount
        },
        error: function(xhr, status) {
            chrome.browserAction.setBadgeText({
                text: "X"
            });
        }
    })

    $.ajax({
        type: "get",
        url: searchTaskURL,
        async: false,
        dataType: "xml",
        success: function(data) {

            var $allxml = $(data)
                // var group = items.groups
                // if ( hasValue(group) && group != "" ) {
                // 	group = group.replace("#","")
                // 	$allxml = removeOtherGroups($allxml, group)
                // }
            var $quantTickets = $allxml.find("sc_task").length
            BadgeCount = BadgeCount + $quantTickets;
            chrome.browserAction.setBadgeText({
                text: (BadgeCount).toString()
            });
            var $ticketNumber = $allxml.find("sc_task").last().find("number")
            var $severity = $allxml.find("sc_task").last().find("priority")
            $severity = "10";
            var $ticketDescription = $allxml.find("sc_task").last().find("short_description")
            var $numberUpdated = $quantTickets
            var $ticketAGroupId = $allxml.find("sc_task").last().find("assignment_group")
            var $ticketAGroup = getAssignmentGroupById($ticketAGroupId.text())

            if (hasValue($currentNumberTickets) && ($quantTickets > $currentNumberTickets) && ($quantTickets > 0)) {
                $ticketNumberGlobal = $ticketNumber.text()
                showNotification($ticketNumber.text(), $ticketDescription.text(), $severity)
            }
            $currentNumberTickets = $quantTickets
        },
        error: function(xhr, status) {
            chrome.browserAction.setBadgeText({
                text: "X"
            });
        }
    })


}

// function loadtaskTickesFromSearchURL (items) {
// 	var searchURL = changeURLforGetXML(items.task)
// 	$.ajax({
//         type: "get",
//         url: searchURL,
// 		async: false,
//         dataType: "xml",
//         success: function(data) {
//
// 			var $allxml = $(data)
// 			// var group = items.groups
// 			// if ( hasValue(group) && group != "" ) {
// 			// 	group = group.replace("#","")
// 			// 	$allxml = removeOtherGroups($allxml, group)
// 			// }
// 			var $quantTickets = $allxml.find("sc_task").length
// 			taskCount = $quantTickets
// 			chrome.browserAction.setBadgeText({text: ($taskCount + $quantTickets).toString()});
// 			var $ticketNumber = $allxml.find("sc_task").last().find("number")
// 			var $severity = $allxml.find("sc_task").last().find("priority")
// 			var $ticketDescription = $allxml.find("sc_task").last().find("short_description")
// 			var $numberUpdated = $quantTickets
// 			var $ticketAGroupId = $allxml.find("sc_task").last().find("assignment_group")
// 			var $ticketAGroup = getAssignmentGroupById($ticketAGroupId.text())
//
// 			if (hasValue($currentNumberTickets) && ($quantTickets > $currentNumberTickets) && ($quantTickets > 0)) {
// 				$ticketNumberGlobal = $ticketNumber.text()
// 				showNotification1($ticketNumber.text(),$ticketDescription.text(), $severity.text())
// 			}
// 			$currentNumberTickets = $quantTickets
//         },
//         error: function(xhr, status) {
//             chrome.browserAction.setBadgeText({text: "X"});
//         }
// 	})
// }

// function loadTicketsFromRootURL(items) {
// 	if (items.rootURL != undefined) {
// 		$rootURL = items.rootURL
// 	}
// 	$.ajax({
//         type: "get",
//         url: $rootURL + "/incident_list.do?XML&sysparm_query=incident_state=3^assignment_group=javascript:gs.getUser().getMyGroups()^%3B%5EORDERBYsys_updated_on&sysparm_view=",
// 		async: false,
//         dataType: "xml",
//         success: function(data) {
// 			var $allxml = $(data)
// 			var group = items.groups
// 			if ( hasValue(group) && group != "" ) {
// 				group = group.replace("#","")
// 				$allxml = removeOtherGroups($allxml, group)
// 			}
// 			var $quantTickets = $allxml.find("incident").length
// 			chrome.browserAction.setBadgeText({text: $quantTickets.toString()});
// 			var $ticketNumber = $allxml.find("incident").last().find("number")
// 			var $ticketDescription = $allxml.find("incident").last().find("short_description")
// 			var $numberUpdated = $quantTickets
// 			var $severity = $allxml.find("incident").last().find("severity")
// 			var $ticketAGroupId = $allxml.find("incident").last().find("assignment_group")
// 			var $ticketAGroup = getAssignmentGroupById($ticketAGroupId.text())
//
// 			if (hasValue($currentNumberTickets) && ($numberUpdated > $currentNumberTickets) && ($numberUpdated > 0)) {
// 				$ticketNumberGlobal = $ticketNumber.text()
// 				showNotification($ticketNumber.text(),$ticketDescription.text(), $severity.text() )
// 			}
// 			$currentNumberTickets = $numberUpdated
//         },
//         error: function(xhr, status) {
//             chrome.browserAction.setBadgeText({text: "X"});
//         }
// 	})
// }

// // function loadWorkflowsFromRootURL(items) {
// 	if (items.rootURL != undefined) {
// 		$rootURL = items.rootURL
// 	}
// 	$.ajax({
//         type: "get",
//         url: $rootURL + "/u_inc_wftask_list.do?XML&sysparm_query=iwt_u_assigned_group%3Djavascript%3AgetMyGroupsAdvanced2(4)%5Eiwt_u_assigned_group%3Dd2c17b14e9082d007e9753d310d3051b%5Eiwt_u_task_status%3D1%5EORDERBYinc_u_updated_by_customer&sysparm_view=",
// 		async: false,
//         dataType: "xml",
//         success: function(data) {
// 			var $allxml = $(data)
// 			var $quantWorkflows = $allxml.find("u_inc_wftask").length
// 			console.log("quantWorkflows " + $quantWorkflows)
// 			$totalPending = $quantWorkflows + $currentNumberTickets
// 			console.log("$totalPending " + $totalPending)
// 			chrome.browserAction.setBadgeText({text: $quantWorkflows.toString() + "-" + $currentNumberTickets });
// 			var $WFNumber = $allxml.find("u_inc_wftask").last().find("inc_number")
// 			var $WFDescription = $allxml.find("u_inc_wftask").last().find("inc_short_description")
// 			var $numberUpdated = $quantWorkflows
//
// 			if (hasValue($currentNumberTickets) && ($quantWorkflows > $currentNumberTask) && ($quantWorkflows > 0)) {
// 				$ticketNumberGlobal = $WFNumber.text()
// 				showNotification($WFNumber.text(),$WFDescription.text())
// 			}
// 			$currentNumberTask = $quantWorkflows
// 			$currentNumberTotal = $currentNumberTask + $currentNumberTickets
//         },
//         error: function(xhr, status) {
//             chrome.browserAction.setBadgeText({text: "X"});
//         }
// 	})
// }

function changeURLforGetXML(url) {
    index = url.indexOf("?")
    return url.slice(0, index + 1) + "XML&" + url.slice(index + 1, url.length)
}

// // function loadFromLink (items) {
// 	urlXML = changeURLforGetXML(items.task)
// 	$.ajax({
//         type: "get",
//         url: urlXML,
//         dataType: "xml",
// 		async: false,
//         success: function(data) {
// 			var $allxml = $(data)
// 			var $quantTask = $allxml.find("incident").length
//
// 			if ($allxml.find("incident").length > 0) {
// 				$quantTask = $allxml.find("incident").length
// 			} else if ($allxml.find("u_interruption_of_service").length > 0) {
// 				$quantTask = $allxml.find("u_interruption_of_service").length
// 			} else if ($allxml.find("problem").length > 0){
// 				$quantTask = $allxml.find("problem").length
// 			} else if ($allxml.find("change_request").length > 0) {
// 				$quantTask = $allxml.find("change_request").length
// 			}
//
// 			var badgeText = $quantTask.toString() + "  " + $currentNumberTickets.toString()
// 			chrome.browserAction.setBadgeText({text: badgeText});
// 			var $ticketNumber = $allxml.find("incident").last().find("number")
// 			var $ticketDescription = $allxml.find("incident").last().find("short_description")
// 			var $numberUpdated = $quantTask
//
// 			if (hasValue($currentNumberTasks) && ($numberUpdated > $currentNumberTasks) && ($numberUpdated > 0)) {
// 				$ticketNumberGlobal = $ticketNumber.text()
// 				showNotification($ticketNumber.text(),$ticketDescription.text())
// 			}
// 			$$currentNumberTasks = $numberUpdated
//         },
//         error: function(xhr, status) {
//             chrome.browserAction.setBadgeText({text: "X X"});
//         }
// 	})
// }

function loadPendingTasks(items) {
    if ($idleState != "locked") {
        if (items.unassigned != undefined && items.unassigned != "") {
            loadTickesFromSearchURL(items)
                // loadtaskTickesFromSearchURL(items)
        } else {
            loadTicketsFromRootURL(items)
        }
    }
}

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        chrome.tabs.create({
            'url': 'chrome://extensions/?options=' + chrome.runtime.id
        });
    }
    getGroupsSaved()
});

chrome.idle.onStateChanged.addListener(function(state) {
    $idleState = state
})
