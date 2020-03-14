console.log("setting interval!");
setInterval(function(){let ev = new Event("calledByTrigger");console.log("sending event trigger!");window.dispatchEvent(ev);}, 2000);