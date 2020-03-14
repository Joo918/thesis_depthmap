var lastEvent = 0;
var textregion = undefined;
var serverurl =  "http://<SERVER_ADDR>";

class VRButton {
	/*
		Collision of instants of this class is tested
		every time the thumbpad is clicked.
	*/
	
	static buttonList = [];
	
	constructor()
	{
		VRButton.buttonList.push(this);
	}
}

function onViewpointChanged(evt)
{
	//console.log(gViewOrientation);
	// show viewpoint values
	if (evt)
	{
		campos = new x3dom.fields.SFVec3f(evt.position.x, evt.position.y, evt.position.z);
		//textregion.setAttribute("string", campos);
	}
}

x3dom.runtime.ready = function(){
	var _viewpointName = 'mainview';
	document.getElementById(_viewpointName).addEventListener('viewpointChanged', onViewpointChanged, false);
	
	textregion = document.getElementById("logInfo");
	textregion.setAttribute("string", "x3dom loaded");
	//var logger = document.getElementById("logInfo");
	//logger.setAttribute("string", "x3dom loaded");
	
	var logger = document.getElementsByTagName("text");
	logger[0].setAttribute("string", "x3dom loaded!!");
	
	/*
	var buttons = document.getElementsByClassName("VRButton");
	console.log(buttons);
	for (i = 0; i < buttons.length; i++){
		console.log("i = " + i);
		buttons[i].click();
	}*/
	
	//$.get(serverurl, {startRecording: "TestSubject02"});
};

handleTrigger = function(e){
	//controller direction vector (SFVec3f)
	//var cDir = e.detail.dir.normalize();
	//controller position vector (SFVec3f)
	//var cPos = e.detail.pos;
	
	//var logger = document.getElementsByTagName("text");
	//logger[0].setAttribute("string", "1");
	
	//textregion.setAttribute("string", "pos: " + campos.toString() + " rot: " + e.detail.rot.toString());
	//textregion.setAttribute("string", e.detail.pos);
	
	//textregion.setAttribute("string", campos);
	
	var cPos = campos.add(e.detail.pos);
	var cDir = e.detail.rot.normalize();
	
	var newDate = new Date();
	if (newDate.getTime() - lastEvent < 1000)
	{
		return;
	}
	
	lastEvent = newDate.getTime();
	
	//Gather all class="VRButton" and handle click positions.
	var buttons = document.getElementsByClassName("VRButton");
	console.log(buttons);
	var closest = undefined;
	var closestDist = 9999999999;
	//var distlist = "";
	for (i = 0; i < buttons.length; i++){
		
		var bPos = x3dom.fields.SFVec3f.parse(buttons[i].getAttribute("translation"));
		var entirePos = new x3dom.fields.SFVec3f.parse(document.getElementById("entireElement").getAttribute("translation"));
		bPos = bPos.add(entirePos);
		
		var toButtonVec = bPos.subtract(cPos);
		var distpt = cPos.add(cDir.multiply(toButtonVec.dot(cDir)));
		var dist = (distpt.subtract(bPos)).length();
		
		if (dist < 1 && dist < closestDist)
		{
			closestDist = dist;
			closest = buttons[i];
		}
	}
	
	if (closest != undefined)
	{
		closest.click();
		textregion.setAttribute("string", "clicking" + closest.getAttribute("bname"));
	}
	else
	{
		textregion.setAttribute("string", "nothing clicked");
	}
}

moveup = function(target, val){
	var t = target;
	console.log("button " + val.toString());
	var trans = t.getAttribute("translation");
	var curPos = x3dom.fields.SFVec3f.parse(trans);
	curPos = curPos.add(new x3dom.fields.SFVec3f(0, 1, 0));
	console.log("curPos: " + curPos.toString());
	t.setAttribute("translation", curPos.toString());
	
	$.get(serverurl, {userResponse: val});
}

//n = selection number
selectCube = function(n){
	console.log("selecting: " + n);
	document.getElementById("switcher").setAttribute("whichChoice", n);
	test();
}

turnOnStereo = function(){
	x3domRenderInStereo = true;
}

turnOffStereo = function(){
	x3domRenderInStereo = false;
}

window.addEventListener("TriggerClicked", function(e){handleTrigger(e)});