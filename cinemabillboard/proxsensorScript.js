function lookAt(feed)
{
	alert("hi");
	console.log("proximity sensor activated!" + feed);
}

function alertme(evt)
{
	console.log("ALERTING");
}

function randomize (positionValue)
{
	var val = Math.floor(Math.random() * 8);
	var arr = ['-12.png', '13.png', '38.png', '-38.png', '63.png', '-64.png', '88.png', '-90.png'];
	var prefix = 'imgs/0/';
	prefix += arr[val];
	pt = new MFString(prefix);
	//blah = new MFString('BLAH!');
}

function setDigits (val, precision) {
  return Math.floor (val*precision + 0.5) / precision;
}

function 

function position (positionValue) {
  var x = setDigits (positionValue[0], 100);
  var y = setDigits (positionValue[1], 100);
  var z = setDigits (positionValue[2], 100);

  positionText = new MFString ('Position  ' + x + '  ' + y + '  ' + z);
//  Browser.print (positionText[0]+'\n');
}
function orientation (orientationValue) {
  var x = setDigits (orientationValue[0], 1000);
  var y = setDigits (orientationValue[1], 1000);
  var z = setDigits (orientationValue[2], 1000);
  var r = setDigits (orientationValue[3], 100);
  orientationText = new MFString ('Orientation  ' + x + '  ' + y + '  ' + z + '  ' + r);
//  Browser.print (orientationText[0]+'\n');
}