var lastEvent = 0;

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

x3dom.runtime.ready = function(){
	//var logger = document.getElementById("logInfo");
	//logger.setAttribute("string", "x3dom loaded");
	
	var logger = document.getElementsByTagName("text");
	logger[0].setAttribute("string", "x3dom loaded");
	
	var buttons = document.getElementsByClassName("VRButton");
	console.log(buttons);
	for (i = 0; i < buttons.length; i++){
		console.log("i = " + i);
		buttons[i].click();
	}
};

handleTrigger = function(e){
	//controller direction vector (SFVec3f)
	//var cDir = e.detail.dir.normalize();
	//controller position vector (SFVec3f)
	//var cPos = e.detail.pos;
	
	//var logger = document.getElementsByTagName("text");
	//logger[0].setAttribute("string", "1");
	
	var newDate = new Date();
	if (newDate.getTime() - lastEvent < 1000)
	{
		return;
	}
	
	lastEvent = newDate.getTime();
	
	//Gather all class="VRButton" and handle click positions.
	var buttons = document.getElementsByClassName("VRButton");
	console.log(buttons);
	for (i = 0; i < buttons.length; i++){
		/*
		var bPos = x3dom.fields.SFVec3f.parse(buttons[i].getAttribute("translation"));
		var toButtonVec = bPos.subtract(cPos);
		var distpt = cPos.add(toButtonVec.dot(cDir));
		
		var dist = (distpt.subtract(bPos)).length();
		if (dist > 1)
		{
			continue;
		}*/
		
		console.log("i = " + i);
		buttons[i].click();
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
}

window.addEventListener("TriggerClicked", handleTrigger.bind(this));