var numLoaded = 0;
var numInlines = 0;
var initDone = [];
var phis = [0];

//config vars
//////////////////////////
var geonOrder = [];
var cueOrderArr = [];
var startConfig = 0;

var curGeon = 0;
var curConfig = 0;

var done = false;

//left = 0, right = 1
var correct = 1;

var taskCount = 0;

var lastTimeStamp = 0;
var maxMoveRange = [0.0,0.0];

var startX = 0.0;

var timeRef = undefined;

//////////////////////////

var thetasSmall = [-45,-30,-15,0,15,30,45];
var thetasBig = [-45,-40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45];

var thetas = thetasSmall;
var maxX = 10
var maxZ = 5
var curImgLoc = "dmap_box/box";

var inlines = ["b1default","b105","b1075","b11","b1125"];
var originalRotations = [];

var campos = new x3dom.fields.SFVec3f(0, 0, 0);

function findClosestPair(theta, phi)
{
	var c_phi = phis[0];
	var c_phi_len = Math.abs(phi - c_phi);
	var c_theta = thetas[0];
	var c_theta_len = Math.abs(theta - c_theta);
	
	for (var i = 1 ; i < phis.length; i++)
	{
		var new_val = Math.abs(phi - phis[i]);
		if (new_val < c_phi_len)
		{
			c_phi = phis[i];
			c_phi_len = new_val;
		}
	}
	
	for (var i = 1 ; i < thetas.length; i++)
	{
		var new_val = Math.abs(theta - thetas[i]);
		if (new_val < c_theta_len)
		{
			c_theta = thetas[i];
			c_theta_len = new_val;
		}
	}
	
	return [c_theta, c_phi];
}

// viewpoint changed
function onViewpointChanged(evt)
{
	if (numLoaded < inlines.length){
		return;
	}
	//console.log(gViewOrientation);
	// show viewpoint values
	if (evt)
	{
		
		campos = new x3dom.fields.SFVec3f(evt.position.x, evt.position.y, evt.position.z);
		console.log(campos);
		if (campos.x - startX > maxMoveRange[1])
		{
			console.log("updating right max move range");
			maxMoveRange[1] = campos.x - startX;
		}
		else if (startX - campos.x > maxMoveRange[0])
		{
			console.log("updating left max move range");
			maxMoveRange[0] = startX - campos.x;
		}
		entirePos = new x3dom.fields.SFVec3f.parse(document.getElementById("entireElement").getAttribute("translation"));
		
		if (campos.z - entirePos.z != maxZ)
		{
			document.getElementById("entireElement").setAttribute("translation", new x3dom.fields.SFVec3f(entirePos.x, -1, campos.z - maxZ));
		}
		
		if (campos.x - entirePos.x > maxX)
		{
			console.log("hit +!");
			document.getElementById("entireElement").setAttribute("translation", new x3dom.fields.SFVec3f(campos.x - maxX, -1, entirePos.z));
		}
		else if (campos.x - entirePos.x < -maxX)
		{
			console.log("hit -!");
			document.getElementById("entireElement").setAttribute("translation", new x3dom.fields.SFVec3f(campos.x + maxX, -1, entirePos.z));
		}
		
		entirePos = new x3dom.fields.SFVec3f.parse(document.getElementById("entireElement").getAttribute("translation"));
		for (var j = 0 ; j < 2 ; j++){
			//sneaky way to bypass unneeded loops
			if (j == 1){
				j = parseInt(document.getElementById("switcher").getAttribute("whichChoice")) + 1;
				//console.log("j= " + j);
			}
			console.log("processing:" + inlines[j]);
			
			//Get object position and rotation
			var bpos = document.getElementById(inlines[j] + '__objTrans').getAttribute('translation');
			var brot = originalRotations[j];
			
			
			//Get viewpoint position (head)
			var viewptPos = new x3dom.fields.SFVec3f(evt.position.x, evt.position.y, evt.position.z);
			
			var parsedpos = x3dom.fields.SFVec3f.parse(bpos);
			parsedpos = parsedpos.add(entirePos);
			var parsedRot = x3dom.fields.SFMatrix4f.parseRotation(brot);
			var forwardVec = new x3dom.fields.SFVec3f(0, 0, 1);
			
			
			//this is the vector that points to where the object is facing. For now, should be orthogonal to y axis
			var objFaceDir = parsedRot.multMatrixPnt(forwardVec);
			//Direction vector from object to viewer
			var direction = viewptPos.subtract(parsedpos);
			//Direction that is flat on the xz plane.
			var direction_flat = new x3dom.fields.SFVec3f(direction.x, 0, direction.z);
			
			//console.log(objFaceDir);
			//console.log(direction_flat);
			
			//cross product. Either faces in the y axis or the -y axis direction. If positive y, user is in positive theta area, vice versa.
			var cross = objFaceDir.cross(direction_flat);
			var thetaMultiplier = cross.y >= 0 ? 1 : -1;
			
			//dot product to compute the angle between.
			var dot = objFaceDir.dot(direction_flat);
			var cos_theta = dot / (objFaceDir.length() * direction_flat.length());
			
			//theta value
			var theta = -Math.acos(cos_theta) * thetaMultiplier * 180 / Math.PI;
			//console.log("theta:");
			//console.log(theta);
			
			//if viewpoint's above object, phi is positive.
			var phiMultiplier = direction.y > 0 ? 1 : -1;
			var dotPhi = direction_flat.dot(direction);
			var cos_phi = dotPhi / (direction_flat.length() * direction.length());
			
			//phi value
			var phi = Math.acos(cos_phi) * phiMultiplier * 180 / Math.PI;
			//console.log("phi:");
			//console.log(phi);
			
			var closestImageAngles = findClosestPair(theta, phi);
			
			var img = document.getElementById(inlines[j] + '__img');
			var depthimg = document.getElementById(inlines[j] + '__depthimg');
			var boxtype = document.getElementById(inlines[j]).getAttribute("boxname");
			
			var imgurl = curImgLoc + boxtype + '/phi=' + closestImageAngles[1].toString() + '_theta=' + closestImageAngles[0].toString() + '_col.png';
			var depthimgurl = curImgLoc + boxtype + '/phi=' + closestImageAngles[1].toString() + '_theta=' + closestImageAngles[0].toString() + '_depth.png';
			
			var originalurl = img.getAttribute('url');
			
			//console.log(evt.orientation);
			
			if (originalurl == imgurl)
			{
				//console.log("same url!");
			}
			else{
				
				//compute the new rotation that the object should face.
				var newRot = new x3dom.fields.SFVec4f(0/*evt.orientation[0].x*/, 1/*evt.orientation[0].y*/, 0/*evt.orientation[0].z*/, -closestImageAngles[0] * Math.PI / 180 /*evt.orientation[1]*/);
				//console.log("new rot:");
				//console.log(newRot);
				console.log(depthimgurl);
				console.log(imgurl);
				
				document.getElementById(inlines[j] + '__objTrans').setAttribute('rotation', newRot.toString());
				
				depthimg.setAttribute('url', depthimgurl);
				img.setAttribute('url', imgurl);
			}
			/*
			
			var img = document.getElementById('bill' + j.toString() + '__imgLoc');
			if (img == null)
			{
				console.log('null!');
			}
			//img.setAttribute('url','imgs/0/-12.png');
			
			var thetaSelection = 0;
			var minDiff = 9999;
			for (var i = 0 ; i < thetas.length ; i++)
			{
				var curDiff = Math.abs(thetad - thetas[i]);
				if (curDiff < minDiff)
				{
					minDiff = curDiff;
					thetaSelection = i;
				}
			}
			
			var phiSelection = 0;
			minDiff = 9999;
			for (var i = 0 ; i < thetas.length ; i++)
			{
				var curDiff = Math.abs(reCalcPhid - phis[i]);
				if (curDiff < minDiff)
				{
					minDiff = curDiff;
					phiSelection = i;
				}
			}
			
			var result = 'imgs/';
			result += thetas[thetaSelection].toString();
			result += '/';
			result += phis[phiSelection].toString();
			result += '.png';
			console.log(result);
			img.setAttribute('url', result);*/
		}
	}
	
}

function addLoaded(val)
{
	console.log("done loading an inline!");
	
	var brot = document.getElementById(inlines[val] + '__objTrans').getAttribute('rotation');
	originalRotations[val] = brot;
	
	console.log(originalRotations);
	
	numLoaded++;
}

function makeInline(objName)
{
	console.log("making an inline");
	var newInline = document.createElement("Inline");
	newInline.setAttribute("mapDEFToID", "true");
	newInline.setAttribute("onload", "addLoaded(" + inlines.length.toString() + ")");
	newInline.setAttribute("nameSpaceName", objName);
	newInline.setAttribute("url", "ibrobj.x3d");
	//############## BUG: MAYBE I NEED TO ADD ATTRIBUTE INSTEAD OF SETTING? ##############
	
	inlines.push(objName);
	originalRotations.push("0 0 0 0");
	
	document.getElementById("inlinegroup").appendChild(newInline);
	//numInlines++;
	//console.log("added an inline!")
}

//should the ibr objects order swap? 50 50 chance
function shouldSwap()
{
	return Math.random() > 0.5;
}

function swapX(str)
{
	if (str.charAt(0) == '-'){
		correct = 0;
		return str.substring(1);
	}
	else
	{
		correct = 1;
		return "-" + str;
	}
}

function retrieveAndUpdateTimestamp()
{
	var curT = lastTimeStamp;
	//console.log("last recorded time: " + curT);
	timeRef = new Date();
	lastTimeStamp = timeRef.getTime();
	//console.log("new recorded time: " + lastTimeStamp);
	return lastTimeStamp - curT;
}

//ibrobj = what combination of ibr obj to use 0-7
//cueorder = the order of cues. 1=depthmap, 2=stereo, 3=numImgs; ex) [1,3,2]
//config = what mix of cues to use. Binary switch; ex) 5 = 101
function setUpAccordingToCode(ibrobj, cueorder, config){
	//change ibr objs & imgs in there
	var switchChoice = ibrobj % 4;
	document.getElementById("switcher").setAttribute("whichChoice", switchChoice);
	
	//swap to box or sphere based on ibrobj
	if (ibrobj >= 4){
		curImgLoc = "dmap_sphere/sphere";
	}
	else
	{
		curImgLoc = "dmap_box/box";
	}
	
	//change base
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	var img = document.getElementById(inlines[0] + '__img');
	var depthimg = document.getElementById(inlines[0] + '__depthimg');
	var boxtype = document.getElementById(inlines[0]).getAttribute("boxname");
	
	var imgurl = curImgLoc + boxtype + '/phi=0_theta=0_col.png';
	var depthimgurl = curImgLoc + boxtype + '/phi=0_theta=0_depth.png';
	
	document.getElementById(inlines[0] + '__objTrans').setAttribute('rotation', "0 1 0 0");
	
	depthimg.setAttribute('url', depthimgurl);
	img.setAttribute('url', imgurl);
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	//change longer
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	img = document.getElementById(inlines[switchChoice + 1] + '__img');
	depthimg = document.getElementById(inlines[switchChoice + 1] + '__depthimg');
	boxtype = document.getElementById(inlines[switchChoice + 1]).getAttribute("boxname");
	
	imgurl = curImgLoc + boxtype + '/phi=0_theta=0_col.png';
	depthimgurl = curImgLoc + boxtype + '/phi=0_theta=0_depth.png';
	
	document.getElementById(inlines[switchChoice + 1] + '__objTrans').setAttribute('rotation', "0 1 0 0");
	
	depthimg.setAttribute('url', depthimgurl);
	img.setAttribute('url', imgurl);
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//randomly place ibr objs
	if (shouldSwap()){
		var original = document.getElementById("base").getAttribute("translation");
		var swapped = swapX(original);
		
		document.getElementById("base").setAttribute("translation", swapped);
		document.getElementById("longer").setAttribute("translation", original);
	}
	
	//change depthcue settings
	for (var i = 0 ; i < 3 ; i++)
	{
		var cueon = (4 >> i) & config;
		if (cueon)
		{
			switch (cueorder[i]){
				case 1:
					console.log("depth map on");
					document.getElementById(inlines[0] + '__prot').setAttribute("value", "1.0");
					
					var protVal = document.getElementById(inlines[switchChoice + 1]).getAttribute('prot');
					document.getElementById(inlines[switchChoice + 1] + '__prot').setAttribute("value", protVal);
					
					break;
				
				case 2:
					console.log("stereo on");
					x3domRenderInStereo = true;
					break;
				
				case 3:
					console.log("numImgs many");
					thetas = thetasBig;
					break;
			}
		}
		else{
			switch (cueorder[i]){
				case 1:
					console.log("depth map off");
					document.getElementById(inlines[0] + '__prot').setAttribute("value", "0.0");
					document.getElementById(inlines[switchChoice + 1] + '__prot').setAttribute("value", "0.0");
					break;
				
				case 2:
					console.log("stereo off");
					x3domRenderInStereo = false;
					break;
				
				case 3:
					console.log("numImgs few");
					thetas = thetasSmall;
					break;
			}
		}
	}
}

function parseConfig(configStr){
	var splitstr = configStr.split(",");
	for (var i = 0 ; i < splitstr[0].length; i++)
	{
		geonOrder.push(parseInt(splitstr[0].charAt(i)));
	}
	console.log("parsed geon order:");
	console.log(geonOrder);
	
	for (var i = 0 ; i < splitstr[1].length; i++)
	{
		cueOrderArr.push(parseInt(splitstr[1].charAt(i)));
	}
	console.log("parsed cue order:");
	console.log(cueOrderArr);
	
	startConfig = parseInt(splitstr[2]);
	curConfig = startConfig;
	console.log("parsed start config:");
	console.log(startConfig);
}

function startNextTask(){
	console.log("blocking visuals");
	document.getElementById("blackscreen").setAttribute("render", "true");
	
	document.getElementById("base").setAttribute("render", "false");
	document.getElementById("longer").setAttribute("render", "false");
	
	//reset entire objects' positions
	entirePos = new x3dom.fields.SFVec3f.parse(document.getElementById("entireElement").getAttribute("translation"));
	document.getElementById("entireElement").setAttribute("translation", new x3dom.fields.SFVec3f(campos.x, -1, entirePos.z));
	
	if (done)
	{
		console.log("done!");
		return;
	}
	
	console.log("starting new task..." + taskCount++);
	setUpAccordingToCode(geonOrder[curGeon], cueOrderArr, curConfig);
	
	//reset timestamp for next task
	retrieveAndUpdateTimestamp();
	//reset start location
	startX = campos.x;
	maxMoveRange = [0.0, 0.0];
	if (correct){
		console.log("correct answer is [right]");
	}
	else{
		console.log("correct answer is [left]");
	}
	curGeon = curGeon + 1;
	if (curGeon == 8)
	{
		console.log("looped through geons, starting new configuration!");
		curGeon = 0;
		curConfig = curConfig + 1;
		if (curConfig >= 8)
		{
			curConfig = 0;
		}
	}
	if (curConfig == startConfig && curGeon == 0)
	{
		done = true;
	}
	
	console.log("showing visuals");
	document.getElementById("base").setAttribute("render", "true");
	document.getElementById("longer").setAttribute("render", "true");
	
	
	
	document.getElementById("blackscreen").setAttribute("render", "false");
}

recordResponse = function(val){
	var mr = maxMoveRange;
	recordTime = retrieveAndUpdateTimestamp();
	console.log("recording time: " + recordTime);
	$.get(serverurl, {userResponse: '\n' + recordTime})
	.done(function(e){
		console.log("recording: " + val);
		$.get(serverurl, {userResponse: ',' + val})
		.done(function(f){
			console.log("recording correct answer and move range: " + correct + ',' + mr[0] + ',' + mr[1]);
			$.get(serverurl, {userResponse: ',' + correct + ',' + mr[0] + ',' + mr[1]});
		});
	});
	startNextTask();
}

function setUpUser()
{
	$.get(serverurl, {startRecording: "TestSubject"});
	console.log("fetching user info");
	$.get(serverurl, {reqInfo: "True"})
	.done(function(data){
		console.log("data: " + data);
		//var logger = document.getElementsByTagName("text");
		//logger[0].setAttribute("string", data);
		parseConfig(data);
		setTimeout(startNextTask, 2000);
	});
}

x3dom.runtime.ready = function(){
	console.log("ready!");
	
	//makeInline("testibrobj");
	timeRef = new Date();
	
	//bpos = document.getElementById('bill__billboardpos').getAttribute('translation');
	var _viewpointName = 'mainview';
	document.getElementById(_viewpointName).addEventListener('viewpointChanged', onViewpointChanged, false);
	//document.getElementById('psensor').addEventListener('position_changed', onPosChange, false);
	console.log('done init');
	//console.log(gViewOrientation);
	
	textregion = document.getElementById("logInfo");
	textregion.setAttribute("string", "x3dom loaded");
	//var logger = document.getElementById("logInfo");
	//logger.setAttribute("string", "x3dom loaded");
	
	var logger = document.getElementsByTagName("text");
	logger[0].setAttribute("string", "x3dom loaded!!");
	
	setUpUser();
	
};

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 37) {
        x3domRenderInStereo = true;
		//alert('Left was pressed');
    }
    else if(event.keyCode == 39) {
        x3domRenderInStereo = false;
		//alert('Right was pressed');
    }
});

