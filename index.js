'use strict'
// index.js
// This is our main server file

// A static server using Node and Express
const express = require("express");

// local modules
const db = require("./sqlWrap");
const win = require("./pickWinner");


// gets data out of HTTP request body 
// and attaches it to the request object
const bodyParser = require('body-parser');


/* might be a useful function when picking random videos */
function getRandomInt(max) {
  let n = Math.floor(Math.random() * max);
  // console.log(n);
  return n;
}


/* start of code run on start-up */
// create object to interface with express
const app = express();

// Code in this section sets up an express pipeline

// print info about incoming HTTP request 
// for debugging
app.use(function(req, res, next) {
  console.log(req.method,req.url);
  next();
})
// make all the files in 'public' available 
app.use(express.static("public"));

// if no file specified, return the main page
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/compare.html");
});

// Get JSON out of HTTP request body, JSON.parse, and put object into req.body
app.use(bodyParser.json());


app.get("/getWinner", async function(req, res) {
  console.log("getting winner");
  let winner = await win.computeWinner(8);
	getThisThing(winner)
		.then(function(thing) {
		let returnjson = JSON.stringify(thing);
  	res.send(returnjson);
	}).catch(function(error) {
    res.status(500).send(error);
  });
});

var lastone = undefined;
var lasttwo = undefined;

app.get("/getTwoVideos", async function(req, res) {
  console.log("getting two vids");
	const tableContents = await dumpTable();
	//console.log(tableContents);
	const datapoints = tableContents.length;
	var first = getRandomInt(datapoints);
	while (first == lastone || first == lasttwo) {
		first = getRandomInt(datapoints);
	}
	lastone = first;
	const firstConversion = tempConversion(first);
	//console.log(first);

	getThisThing(firstConversion)
		.then(function(firstThing) {
			var second = getRandomInt(datapoints);
			while (second == first || second == lasttwo || second == lastone) {
				second = getRandomInt(datapoints);
			}
			//console.log(second);
			lasttwo = second;
			const secondConversion = tempConversion(second);
			getThisThing(secondConversion)
				.then(function(secondThing) {
					//console.log(firstThing)
					let returnThing = {
						"first" : firstThing,
						"second" : secondThing,
					}
					let returnjson = JSON.stringify(returnThing);
					//console.log(returnjson);
					res.send(returnjson);
				}).catch(function(error) {
					res.status(500).send(error);
			});
		}).catch(function(error) {
			res.status(500).send(error);
	});
});

app.post("/insertPref", async function(req, res) {
	console.log("inserting pref");
	insertPreference(req.body);
	const tableContents = await dumpPrefTable();
	console.log(tableContents.length);
	if (tableContents.length < 15) {
		res.send("continue");
	}
	else {
		res.send("pick winner");
	}
});

// Page not found
app.use(function(req, res){
  res.status(404); 
  res.type('txt'); 
  res.send('404 - File '+req.url+' not found'); 
});

// end of pipeline specification

// Now listen for HTTP requests
// it's an event listener on the server!
const listener = app.listen(3000, function () {
  console.log("The static server is listening on port " + listener.address().port);
});


async function getThisThing(thisThing) {
  // warning! You can only use ? to replace table data, not table name or column name.
  const sql = "select * from VideoTable where rowIdNum = " + thisThing;
	let result = await db.get(sql);
	return result;
}

// an async function to get the whole contents of the database 
async function dumpTable() {
  const sql = "select * from VideoTable";
  
  let result = await db.all(sql);
  return result;
}

async function dumpPrefTable() {
  const sql = "select * from PrefTable";
  
  let result = await db.all(sql);
  return result;
}

async function insertPreference(pref) {
  const sql = "insert into PrefTable (better,worse) values (?,?)";
const better = pref.better;
const worse = pref.worse;
	console.log(better);
	console.log(worse);
await db.run(sql,[pref.better, pref.worse]);
}

// On my tiktokpets2, the database is set to constantly keep the data in order, from 0-7. This program obviously does not do that, but I am going to move forward with the assumption that this is based off of my tiktokpets2, which keeps the data in that order. This is a temporary conversion tool to convert 0-7 into 2, 4, 6-11.
function tempConversion(number) {
	if (number == 0) {
		return 2;
	}
	if (number == 1) {
		return 4;
	}
	if (number == 2) {
		return 6;
	}
	if (number == 3) {
		return 7;
	}
	if (number == 4) {
		return 8;
	}
	if (number == 5) {
		return 9;
	}
	if (number == 6) {
		return 10;
	}
	if (number == 7) {
		return 11;
	}
}