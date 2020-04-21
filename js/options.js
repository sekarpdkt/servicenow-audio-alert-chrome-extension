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
    var $followWorkflow
		var saveMe = {
			'primary': primary,
			'rooturl': rooturl,
			'secondary': secondary,
      'splitcount' : $("input[name='splitcount']:checked").val(),
      'q1name' : $("#q1name").val(),
      'q1url' : $("#q1url").val(),
      'q2name' : $("#q2name").val(),
      'q2url' : $("#q2url").val(),
      'q3name' : $("#q3name").val(),
      'q3url' : $("#q3url").val(),
      'q4name' : $("#q4name").val(),
      'q4url' : $("#q4url").val(),
      'l1name' : $("#l1name").val(),
      'l1url' : $("#l1url").val(),
      'l2name' : $("#l2name").val(),
      'l2url' : $("#l2url").val(),
      'l3name' : $("#l3name").val(),
      'l3url' : $("#l3url").val(),
      'l4name' : $("#l4name").val(),
      'l4url' : $("#l4url").val(),
      'create' : false,
      'call' : false,
      'incident' : false,
      'change' : false,
      'request' : false,
      'search' : false,
      'queues' : false,
      'queue1' : false,
      'queue2' : false,
      'queue3' : false,
      'queue4' : false,
      'lists' : false,
      'list1' : false,
      'list2' : false,
      'list3' : false,
      'list4' : false
		}


		var options = [];
    $.each($("input[name='option']:checked"), function() {
        options.push($(this).val());
				var needle = $(this).val();
						saveMe[needle] = true;
    });

    chrome.storage.sync.set(saveMe, function() {
        showSuccessMessage("Options saved!")
    });
    window.scrollTo(0,0);
    chrome.storage.sync.get(null, function (data) { console.info(data) });
    getSavedData();
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
                             'create',
                             'call',
                             'incident',
                             'change',
                             'request',
                             'search',
                             'queues',
                             'queue1',
                             'queue2',
                             'queue3',
                             'queue4',
                             'lists',
                             'list1',
                             'list2',
                             'list3',
                             'list4',
                             'q1name',
                             'q1url',
                             'q2name',
                             'q2url',
                             'q3name',
                             'q3url',
                             'q4name',
                             'q4url',
                             'l1name',
                             'l1url',
                             'l2name',
                             'l2url',
                             'l3name',
                             'l3url',
                             'l4name',
                             'l4url',
                             'splitcount'], function(items) {
        if(items.splitcount == "true"){
          $("#splitcounttrue").attr("checked", true);
        }else {
          $("#splitcountfalse").attr("checked", true);
        }
        $("#idrooturl").val(items.rooturl);
        $("#idsecondaryq").val(items.secondary);
        $("#idprimaryq").val(items.primary);
        $("#q1name").val(items.q1name),
        $("#q1url").val(items.q1url),
        $("#q2name").val(items.q2name),
        $("#q2url").val(items.q2url),
        $("#q3name").val(items.q3name),
        $("#q3url").val(items.q3url),
        $("#q4name").val(items.q4name),
        $("#q4url").val(items.q4url),
        $("#l1name").val(items.l1name),
        $("#l1url").val(items.l1url),
        $("#l2name").val(items.l2name),
        $("#l2url").val(items.l2url),
        $("#l3name").val(items.l3name),
        $("#l3url").val(items.l3url),
        $("#l4name").val(items.l4name),
        $("#l4url").val(items.l4url),
        $.each(items, function (key, value) {
          if (value === true){
            if(key == "create"){
              $("#" + key).attr("checked", true);
              $(".myHide1").toggle();
            }else if (key == "queues") {
              $("#" + key).attr("checked", true);
              $(".myHide2").toggle();
            }else if (key == "lists") {
              $("#" + key).attr("checked", true);
              $(".myHide3").toggle();
            }
          $("#" + key).attr("checked", true);
          $("." + key).toggle();
          }

        })

    });
}

$(document).ready(function() {
    $("#status").hide()
    restore_options();


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


