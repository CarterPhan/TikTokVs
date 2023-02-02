// when this page is opened, get the most recently added video and show it.
// function is defined in video.js
let divElmt = document.getElementById("tiktokDiv");

let reloadButton = document.getElementById("reload");
// set up button to reload video in "tiktokDiv"
reloadButton.addEventListener("click",function () {
  reloadVideo(tiktokDiv);
});

async function sendGetRequest(url) {
	console.log("about to send get request");
	let response = await fetch(url, {
		method: 'GET',
		headers: { 'Content-Type': 'text/plain' },
	});
	if (response.ok) {
		let data = await response.text();
		return data;
	} else {
		throw Error(response.status);
	}
}

// always shows the same hard-coded video.  You'll need to get the server to 
// compute the winner, by sending a 
// GET request to /getWinner,
// and send the result back in the HTTP response.
sendGetRequest("/getWinner")
	.then(function(result) {
		answer = JSON.parse(result);
		let vidName = answer.nickname;
		let msg = body2.textContent;
		msg = msg.replace("vidname", vidName);
		body2.textContent = msg;
		let winningUrl = answer.url;
  	addVideo(winningUrl, divElmt);
  	loadTheVideos();
});

