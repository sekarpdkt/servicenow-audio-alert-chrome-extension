
<body>
    <h1>Service Now Alert</h1>
    <h3>Setup:</h3>
    <p>Once you have enabled the Service Now (SNOW) Alert Exentension, right click on the extension icon and configure Servicenow instance detail along with queue to be monitored.    
    <h2>Servicenow instance detail</h2>
    <p>Servicenow instance detail allow for notification popup and audio alert when a count is >0 in a queue. You can also display the count of that queue in the Extention Icon bubble.</p>
    <p><strong>Base URL:</strong>This field requires your Base Service Now URL. EX. "https://\<yourinstance\>.service-now.com"</p>
    <p><strong>Notify 1 URL:</strong>This field is for the URL of the first queue you would like notification data from. To get the URL in Service now, create a filtered queue / report as per your requirement (like state is new and created before last 15min) and once the report is coming ok, copy that report's URL here.</p>
    <br />
    <p><strong>Notify 2 URL:</strong>This is the second Notification URL generate URL as you did for Notify 1.</p>
    <p><strong>Split Badge:</strong>This allows you to seperate the two Notify counts in the Extension Icon. If true the Numbers will appear "2 | 3" if False the numbers will be a total: "5"</p><br>
    <h3>Some sample tool bar icon with count:</h3><br>
    <img src="images/split.png" alt=""  style="border:2px solid black"/>
    <img src="images/sum.png" alt="" style="border:2px solid black"/>
    <h3>Credits:</h3>
    https://github.com/Codydanieljones/Service-Now-Alerts
    Forked from above and modified to provide audio alert support


</body>
</html>
