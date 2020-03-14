//User variables!
const usercode = 1;
const serveCode = "14275603,132,0";
const username = "JooyoungWhang"

////////////////////////////////

const http = require('http');
const fs = require('fs');
const url = require('url');

const hostname = '0.0.0.0';
const port = 8123;

const cur_server_ip = 'localhost';

var currentUser = "";
/*
const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
};*/

const server = http.createServer((req, res) => {
  
  console.log("request!");
  
  res.statusCode = 200;

  if (req.method == 'GET')
  {
	var urlObj = url.parse(req.url, true, false);
	if (urlObj.query['Hi'] != null)
	{
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'text/plain');
		res.write('welcome, ' + urlObj.query['Hi'] + '\n');
	}
	else if (urlObj.query['startRecording'] != null)
	{
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'text/plain');
	  //start recording contains the user name
		try {
			fs.accessSync('./' + username + usercode + '.txt', fs.constants.W_OK | fs.constants.R_OK);
			fs.unlinkSync('./' + username + usercode + '.txt');
		} catch (e) {

		}

		currentUser = username + usercode;
		fs.appendFileSync('./' + username + usercode + '.txt', '#' + username + usercode, 'utf8');
		fs.appendFileSync('./' + username + usercode + '.txt', '\n#time,answer,correct,maxMoveL,maxMoveR', 'utf8');

		console.log("starting recording");
	}
	else if (urlObj.query['userResponse'] != null)
	{
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'text/plain');
		fs.appendFileSync('./' + currentUser + '.txt', urlObj.query['userResponse'], 'utf8');
	}
	else if (urlObj.query['endRecording'] != null)
	{
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'text/plain');
		fs.appendFileSync('./' + currentUser + '.txt', 'end-of-response', 'utf8');
		currentUser = "";
		console.log("ending recording");
	}
	
	else if (urlObj.query['reqInfo'] != null)
	{
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'text/plain');
		res.write(serveCode);
		console.log("sent req info");
	}
	else if (urlObj.path.length > 1)
	{
		console.log(urlObj.path);
		console.log(__dirname);
		
		var textType = false;
		if (urlObj.path.includes(".png"))
		{
			res.setHeader('Content-Type', 'image/png');
		}
		else if (urlObj.path.includes(".html"))
		{
			res.setHeader('Content-Type', 'text/html');
			textType = true;
		}
		else if (urlObj.path.includes(".txt"))
		{
			res.setHeader('Content-Type', 'text/plain');
			textType = true;
		}
		else if (urlObj.path.includes(".js"))
		{
			res.setHeader('Content-Type', 'application/javascript');
			textType = true;
		}
		else if (urlObj.path.includes(".x3d"))
		{
			res.setHeader('Content-Type', 'model/x3d+xml');
			textType = true;
		}
		else if (urlObj.path.includes(".css"))
		{
			res.setHeader('Content-Type', 'text/css');
			textType = true;
		}
		
		try {
			var readdata = fs.readFileSync(__dirname + '/depthmap' + urlObj.path)
			
			if (textType)
			{
				readdata = readdata.toString();
				readdata = readdata.replace(/<SERVER_ADDR>/g, cur_server_ip + ':' + port);
			}
			
			res.write(readdata);
		} catch (err) {
			console.error(err)
		}
	}
  }
  else
  {
	console.log("NO SUPPORT FOR POST REQUESTS");
  }

  res.end('');
  //console.log(req.headers);
  //console.log(req.method);

  //res.write("testy test\n");

  //res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});