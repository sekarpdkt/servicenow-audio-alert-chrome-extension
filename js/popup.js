var $rootURL;
var savedData;

function loadOptions() {
    chrome.storage.sync.get(['rooturl', 'q1name', 'q1url', 'q2name', 'q2url', 'q3name', 'q3url' , 'q4name', 'q4url' , 'l1name' , 'l1url' , 'l2name', 'l2url', 'l3name', 'l3url', 'l4name', 'l4url', 'create', 'call', 'incident', 'change', 'request', 'search', 'queues', 'queue1', 'queue2', 'queue3', 'queue4', 'lists', 'list1', 'list2', 'list3', 'list4'], function(items) {
				savedData = items;

				if (items.rooturl == undefined) {
            console.log("Root URL not Set.");
        }
        $rootURL = items.rooturl;
        $.each(items, function(key, value) {
            if (value == true || value == false) {
                if (value == true) {
                    var myClass = "." + key;
                    $(myClass).toggle();
                } else {}
            } else {
                var str = value;
                var ishttp = str.substr(0, 4);
                if (ishttp == "http") {} else {
                    var myClass = "." + key;
                    $(myClass).html(value);
                }
            }
        });
    })
}

$(document).ready(function() {
    loadOptions()



    $("#searchinput").keyup(function(event) {
        if (event.keyCode == 13) {
            $("#idsearch").click();
        }
    })

    $("#queue1btn").click(function() {
        chrome.tabs.create({
            active: true,
            url: savedData.q1url
        });
    })
    $("#queue2btn").click(function() {
        chrome.tabs.create({
            active: true,
            url: savedData.q2url
        });
    })
    $("#queue3btn").click(function() {
        chrome.tabs.create({
            active: true,
            url: savedData.q3url
        });
    })
    $("#queue4btn").click(function() {
        chrome.tabs.create({
            active: true,
            url: savedData.q4url
        });
    })

    $("#list1btn").click(function() {
        chrome.tabs.create({
            active: true,
            url: savedData.l1url
        });
    })
    $("#list2btn").click(function() {
        chrome.tabs.create({
            active: true,
            url: savedData.l2url
        });
    })
    $("#list3btn").click(function() {
        chrome.tabs.create({
            active: true,
            url: savedData.l3url
        });
    })
    $("#list4btn").click(function() {
        chrome.tabs.create({
            active: true,
            url: savedData.l4url
        });
    })


    $("#newcallbtn").click(function() {
        chrome.tabs.create({
            active: true,
            url: $rootURL + "/nav_to.do?uri=%2Fnew_call.do%3Fsysparm_stack%3Dnew_call_list.do%26sys_id%3D-1"
        });
    })
    $("#newticketbtn").click(function() {
        chrome.tabs.create({
            active: true,
            url: $rootURL + "/nav_to.do?uri=%2Fincident.do%3Fsys_id%3D-1%26sysparm_query%3Dactive%3Dtrue%26sysparm_stack%3Dincident_list.do%3Fsysparm_query%3Dactive%3Dtrue"
        });
    })
    $("#newrequestbtn").click(function() {
        chrome.tabs.create({
            active: true,
            url: $rootURL + "/nav_to.do?uri=%2Fcatalog_home.do%3Fv%3D1%26sysparm_catalog%3De0d08b13c3330100c8b837659bba8fb4%26sysparm_catalog_view%3Dcatalog_default"
        });
    })
		$("#newchangebtn").click(function() {
        chrome.tabs.create({
            active: true,
            url: $rootURL + "/nav_to.do?uri=%2Fwizard_view.do%3Fsys_target%3Dchange_request%26sysparm_stack%3Dchange_request_list.do%26sysparm_wizardAction%3Dsysverb_new%26sysparm_parent%3D8db4a378c611227401b96457a060e0f4"
        });
    })

    $("#idsearch").click(function() {
        var $input = $("#searchinput").val()
        var urlTicketSearch;
        switch ($input.substring(0,3)) {
      			case "TAS":
      					urlTicketSearch = $rootURL + "/sc_task.do?sys_id=" + $input
      					break;
      			case "INC":
      					urlTicketSearch = $rootURL + "/incident.do?sys_id=" + $input
      					break;
      			case "REQ":
      					urlTicketSearch = $rootURL + "/sc_request.do?sys_id=" + $input
      					break;
      			case "CHG":
      					urlTicketSearch = $rootURL + "/change_request.do?sys_id=" + $input
      					break;
      			case "RIT":
      					urlTicketSearch = $rootURL + "/sc_req_item.do?sys_id=" + $input
      					break;
      			case "CAL":
      					urlTicketSearch = $rootURL + "/new_call.do?sys_id=" + $input
      					break;
      			default:
      					urlTicketSearch = $rootURL + "/task_list.do?sysparm_query=numberLIKE" + $input + "&sysparm_first_row=1&sysparm_view=" + $input
      	}

        chrome.tabs.create({
            'url': urlTicketSearch
        })
    })
});
