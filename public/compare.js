let videoElmts = document.getElementsByClassName("tiktokDiv");

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

// input data should be an object, 
// which will be sent as JSON
async function sendPostRequest(url,data) {
  params = {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data) };
  console.log("about to send post request");
  
  let response = await fetch(url,params);
  if (response.ok) {
    let data = await response.text();
    return data;
  } else {
    throw Error(response.status);
  }
}


sendGetRequest("/getTwoVideos")
	.then(function(result) {
		answer = JSON.parse(result);
		console.log(answer);

		var pref = undefined;
		
		let reloadButtons = document.getElementsByClassName("reload");
		let heartButtons = document.querySelectorAll("div.heart");
		for (let i=0; i<2; i++) {
		  let reload = reloadButtons[i]; 
		  reload.addEventListener("click",function() { reloadVideo(videoElmts[i]) });
		  let loverBoy = heartButtons[i];
			loverBoy.classList.add("unloved");
			loverBoy.addEventListener("click", function() {
				loverBoy.classList.remove("unloved");
				pref = i;
				console.log(pref);
				if (i == 0) {
					heartButtons[1].classList.add("unloved");
				}
				else {
					heartButtons[0].classList.add("unloved");
				}
			});
			
		} // for loop
		
		// hard-code videos for now
		// You will need to get pairs of videos from the server to play the game.
		const urls = [answer.first.url, answer.second.url];
		
		for (let i=0; i<2; i++) {
		      addVideo(urls[i],videoElmts[i]);
		}
		    // load the videos after the names are pasted in! 
		loadTheVideos();

		let nextButton = document.getElementById("nextMan");
		nextButton.addEventListener("click", function() {
			let firstID = answer.first.rowIdNum;
			let secondID = answer.second.rowIdNum;
			if (pref == 0) {
				let sending = {
					"better" : firstID,
					"worse" : secondID
				}
				sendPostRequest("/insertPref", sending)
					.then(function(result) {
						if (result == "continue") {
							location.reload();
							return false;
						}
						else {
							window.location = "/winner.html";
						}
					})
					.catch(function(error) {
						console.log("Error occurred:", error)
				});
			} 
			else {
				let sending = {
					"better": secondID,
					"worse": firstID
				}
				sendPostRequest("/insertPref", sending)
					.then(function(result) {
						if (result == "continue") {
							location.reload();
							return false;
						}
						else {
							window.location = "/winner.html";
						}
					})
					.catch(function(error) {
						console.log("Error occurred:", error)
				});
			}
		});

		
});