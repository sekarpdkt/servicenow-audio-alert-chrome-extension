$("#urlfield").hide();

window.onload = function() { var htmlStyle = document.querySelector('html').style; chrome.windows.getCurrent(function(currentWindow) {  htmlStyle.width = (currentWindow.width*.25) + 'px'; console.log(htmlStyle.height, htmlStyle.width); }); };

$(".clicker").click(function(){
  var myClass = $(this).attr("class");
  myClass = myClass.split(/\s+/);
  var last = myClass.length - 1;
  toggleView(myClass[last]);


})


function toggleView(myClass) {
    var showorhide = myClass.substr(0, 1);
    if (showorhide === "q") {
      var final = myClass.length;
      myClass = ".queue" + myClass.substr(final - 1);
      $(myClass).toggle();
  }else if(showorhide === "l"){
    var final = myClass.length;
    myClass = ".list" + myClass.substr(final - 1);
    $(myClass).toggle();
    }else {
      var final = myClass.length;
      myClass = ".myHide" + myClass.substr(final - 1);
      $(myClass).toggle();
    }
}




function getRootURL(searchunacceptedurl) {
    index = searchunacceptedurl.indexOf("/", 10)
    return searchunacceptedurl.slice(0, index)
}

// Saves options to chrome.storage
function save_options() {
    var primary = $("#idprimaryq").val()
    var rooturl = $("#idrooturl").val()
    var secondary = $("#idsecondaryq").val()
    var pollInterval=parseInt($("#pollInterval").val());
    if(pollInterval<1 || pollInterval==undefined) 
        pollInterval=5;
    if (isNaN(pollInterval)) 
        pollInterval=5;
    var $followWorkflow
		var saveMe = {
			'primary': primary,
			'rooturl': rooturl,
			'secondary': secondary,
            'pollInterval':pollInterval,
      'splitcount' : $("input[name='splitcount']:checked").val(),
      'disableAlarm' : $("input[name='disableAlarm']:checked").val(),
      'disablePoll' : $("input[name='disablePoll']:checked").val(),
      'nonZeroCount' : $("input[name='nonZeroCount']:checked").val(),
      'alarmOnNewEntry' : $("input[name='alarmOnNewEntry']:checked").val()
		}


    if(saveMe.nonZeroCount == saveMe.alarmOnNewEntry){
        $("#nonZeroCount").attr("checked", true);
        $("#alarmOnNewEntry").attr("checked", false);
        saveMe.nonZeroCount ="on";
        saveMe.alarmOnNewEntry =null;
    }

    chrome.storage.sync.set(saveMe, function() {
        showSuccessMessage("Options saved!")
        chrome.storage.sync.get(null, function (data) { 
            console.info(data) 
        });
        getSavedData();
    });
    window.scrollTo(0,0);
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
    $("input").val("");
    $(".check").attr("checked", false);
    $("#nonZeroCount").attr("checked", true);

    var status = document.getElementById('status');
    status.textContent = 'Options erased';
    $("#status").show();
    setTimeout(function() {
        $("#status").hide();
        status.textContent = '';
    }, 3000);
}




function restore_options() {
    chrome.storage.sync.get(['rooturl',
                             'primary',
                             'secondary',
                             'disableAlarm',
                             'disablePoll',
                             'pollInterval',
                             'alarmOnNewEntry',
                             'nonZeroCount',
                             'splitcount'], function(items) {
        if(items.splitcount == "true"){
          $("#splitcounttrue").attr("checked", true);
        }else {
          $("#splitcountfalse").attr("checked", true);
        }

        if(items.disableAlarm == "on"){
          $("#disableAlarm").attr("checked", true);
        }
        
        
        if(items.disablePoll == "on"){
          $("#disablePoll").attr("checked", true);
        }
        
        if(items.alarmOnNewEntry == "on"){
          $("#alarmOnNewEntry").attr("checked", true);
        }
        
        if(items.nonZeroCount == "on"){
          $("#nonZeroCount").attr("checked", true);
        }
        
        var pollInterval=parseInt(items.pollInterval);
        if(pollInterval<1 || pollInterval==undefined) 
            pollInterval=5;
        if (isNaN(pollInterval)) 
            pollInterval=5;

        $("#pollInterval").val(pollInterval);
        $("#idrooturl").val(items.rooturl);
        $("#idsecondaryq").val(items.secondary);
        $("#idprimaryq").val(items.primary);
    });
}

$(document).ready(function() {
    $("#status").hide()
    restore_options();
    $("#lastPollAt").text(getlastPollAt());

    $("#idprimaryq").focusout(function(event) {
                $("#save").click();
        })

    $("#idrooturl").focusout(function(event) {
                $("#save").click();
        })

    $("#idsecondaryq").focusout(function(event) {
                $("#save").click();
        })

    $("#idprimaryq").keyup(function(event) {
        if (event.keyCode == 13) {
            $("#save").click();
        }
    })
    $("#idrooturl").keyup(function(event) {
        if (event.keyCode == 13) {
            $("#save").click();
        }
    })
    $("#idsecondaryq").keyup(function(event) {
        if (event.keyCode == 13) {
            $("#save").click();
        }
    })
});

document.getElementById('save').addEventListener('click', save_options);
document.getElementById('clear').addEventListener('click', clear_options);


