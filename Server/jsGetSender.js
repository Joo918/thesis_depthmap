function sendUserName(nameVar)
{
    console.log("sending name");   
    $.get("http://10.0.0.194:8123", {startRecording: nameVar});
}

function sendResponse(responseVar)
{
    console.log("sending response");
    $.get("http://10.0.0.194:8123", {userResponse: responseVar});
}

function endReq()
{
    console.log("sending end");
    $.get("http://10.0.0.194:8123", {endRecording: "True"});
}