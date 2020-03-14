function go(e)
{
	console.log("it works!");
}
window.addEventListener("calledByTrigger", go.bind(this));