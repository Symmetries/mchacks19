let sketchFunction = s => {
	let video;
	let poseNet;
	let poses = [];
	let left_hand_X=[];
	let right_hand_X=[];
	let left_hand_Y=[];
	let right_hand_Y=[];
	let left_hand_score_X=[];
	let right_hand_score_X=[];
	let left_hand_score_Y=[];
	let right_hand_score_Y=[];
	let count = 0;
	let numFrames = 60;
	let lastAvgX = lastAvgY = NaN;
	let lastPredX, lastPredY;
  //Teresa
  let tmpArrayX = [];
  let tmpArrayY = [];
  let Mpt = [];
  let r = 20;
  let curbestPosRX;
  let curbestPosLX;
  let curbestPosRY;
  let curbestPosLY;
  let prevbestPosRX=null;
  let prevbestPosLX=null;
  let prevbestPosRY=null;
  let prevbestPosLY=null;
  //Diego
  let lastPoints = [];
  let startTime;

	s.setup = () => {
		var cnv=s.createCanvas(800, 500);
    var x = (s.windowWidth - s.width) / 2;
    var y = (s.windowHeight - s.height+30) / 2;
    cnv.position(x, y);
    s.background(255, 255, 255);
		if (isDrawing) {
      video = s.createCapture(s.VIDEO);
      video.size(s.width, s.height);

      poseNet = ml5.poseNet(video, modelReady);
      poseNet.on('pose', function (results) {
        poses = results;
      });
      video.hide();
    }

    let date = new Date();
    startTime = date.getTime();
	}

  function modelReady() {

  }

  s.draw = () => {
    if (finished) s.remove();
    let date = new Date();
    timeElapsed = date.getTime() - startTime;
    if (timeElapsed % 100 == 0)
      s.print(timeElapsed);
    let limit = 15
    if (isDrawing) 
      message("You have " + s.floor(limit - timeElapsed/1000) + " seconds to draw a(n) " + correctChoice);
    else
      message("You have " + s.floor(limit - timeElapsed/1000) + " to guess what is drawn");
    if (timeElapsed > limit * 1000) {
      timeOver();
      s.remove();
    }

    if (isDrawing) { 
      drawKeypoints();
    } else {
      s.strokeWeight(10);
      s.stroke(255, 204, 0);
      s.beginShape();
      points.forEach(point => s.vertex(point.x, point.y));
      s.endShape();
    }
	}

  //attempt one to make the lines smoother...
function attempt1(mx,my,x1,y1,x2,y2){
  if(x1==null&& y1==null){
    Mpt[0]=x2;
    Mpt[1]=y2;
  }
  else if(x1 != x2 || y1 != y2){
      if(attempt2(mx, my,x1,y1,x2, y2)!=0){
      
        Mpt[0]=(x1+x2)/2;
        Mpt[1]=(y1+y2)/2;
      }
  }
}

//This function takes the coordiantes of the m point from attempt1 and checks for outliers
//If an outlier is found, it checks if there is at least another outlier. If it is the case, it does nothing (you should apply attempt1 after this method. 
//If not it just increments the x coordinate of m by x1.
function attempt2(mx,my,x1,y1,x2,y2){
  var dist1 = s.dist(mx,my,x1,y1);
  var dist2 = s.dist(mx,my,x2,y2);
  if(dist1 > r && dist2 >r){
    //do nothing
    return 1;
  }
  else{
    Mpt.push(mx + x1);
    Mpt.push(my);
    return 0;
  }
}

function drawKeypoints()  {

		if( poses.length > 0){
			left_hand_X.push(poses[0].pose.keypoints[9].position.x);
			right_hand_X.push(poses[0].pose.keypoints[10].position.x);
			left_hand_Y.push(poses[0].pose.keypoints[9].position.y);
			right_hand_Y.push(poses[0].pose.keypoints[10].position.y);
			left_hand_score_X.push(poses[0].pose.keypoints[9].score);
			right_hand_score_X.push(poses[0].pose.keypoints[10].score);
			left_hand_score_Y.push(poses[0].pose.keypoints[9].score);
			right_hand_score_Y.push(poses[0].pose.keypoints[10].score);

			if(count == numFrames){
				// if(random() < 0.01){
				//     print(poses);
				// }
				curbestPosRX=averageW(right_hand_X,right_hand_score_X);
        curbestPosLX=averageW(left_hand_X, left_hand_score_X);
        curbestPosRY=averageW(right_hand_Y, right_hand_score_Y);
        curbestPosLY=averageW(left_hand_Y, left_hand_score_Y);

        attempt1(Mpt[0],Mpt[1],prevbestPosRX, prevbestPosRY, curbestPosRX, curbestPosRY);

        prevbestPosRX = curbestPosRX;
        prevbestPosRY = curbestPosRY;

				let curAvgX = s.width - curbestPosRX;
        let curAvgY = curbestPosRY;
				let curPredX = s.width - poses[0].pose.keypoints[10].position.x;
				let curPredY = poses[0].pose.keypoints[10].position.y;

			lastPoints.push({x: curAvgX, y: curAvgY});
        if (lastPoints.length == 10) {
          updateLastPoint(lastPoints);
            lastPoints = [];
        }


				if (lastAvgX != NaN) {
					s.strokeWeight(10);
					s.stroke(255, 204, 0);
					s.line(lastAvgX,lastAvgY, curAvgX, curAvgY);
					// stroke(0);
					// line(lastPredX, lastPredY, curPredX, curPredY);
				}
				lastAvgX = curAvgX;
				lastAvgY = curAvgY;
				lastPredX = curPredX;
				lastPredY = curPredY;

				left_hand_X.shift();
				right_hand_X.shift();
				left_hand_Y.shift();
				right_hand_Y.shift();
				left_hand_score_X.shift();
				right_hand_score_X.shift();
				left_hand_score_Y.shift();
				right_hand_score_Y.shift();
				count--;
			}

			count ++;
		}
	}

  //A function to get the weighted average 
  function averageW(pos, score){
    var av=0;
    var s=0;
    for(i=0; i<pos.length; i++){
        av = av + score[i]*pos[i];
        s = s + score[i];
    }
    return av/s;
  }
}

function timeOver() {
  roomDocRef.update({status: "finished"});
  message("Time is Over, You Have Lost :(");
}

function updateLastPoint(points) {
  roomDocRef.update({lastPoints: points});  
}

function playTurn(data) {
  if (data.status == "joined") { 
    if (!roundStarted) {
      roundStarted = true;
      turn = data.turn;
      isDrawing = (data.turn % 2 == 0) == isCreator;
      if (isDrawing) {
        choices = choose(guesses);
        correctChoice = choose(choices);
        p5Sketch = new p5(sketchFunction, 'p5sketch');
        document.querySelector("#room-code-input").style.display = 'none';
        roomDocRef.update({choices: choices, correctChoice: correctChoice});
      } else {
        p5Sketch = new p5(sketchFunction, 'p5sketch');
        document.querySelector("#room-code-input").style.display = 'none';
        document.querySelector(".twoButtons").style.display = 'flex';
      }
    } else if (!isDrawing) {
      if (data.lastPoints) {
        data.lastPoints.forEach(point => {
          points.push(point);
        });
      }
      leftChoiceButton.innerHTML = data.choices[0];
      rightChoiceButton.innerHTML = data.choices[1];
      correctChoice = data.correctChoice;
    }
  } else if (data.status == "finished" && isCreator) {
    userChoice = data.userChoice;
    console.log(data)
    if (userChoice == correctChoice) {
      win();
    } else {
      lose();
    }
  }
}

function message(str) {
  messageP.innerHTML = str;
}

function choose(choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}

function win() {
  setTimeout(() => message("Congratulations, you have won!"), 1000);
  console.log(userChoice);
  finished = true;
  if (!isCreator) {
    roomDocRef.update({status: "finished", userChoice: userChoice});
  }
}

function lose() {
  setTimeout(() => message("Did not guess " + correctChoice + ", you have lost"), 1000);
  console.log(userChoice);
  finished = true;
  if (!isCreator) {
    roomDocRef.update({status: "finished", userChoice: userChoice});
  }
}

let db;
let p5Sketch
let createRoomButton;
let joinRoomButton;
let leftChoiceButton;
let rightChoiceButton;
let messageP;
let roomCodeInput;
let isCreator;
let roundStarted = false;
let isDrawing = false;
let points = [];
let roomDocRef;
let finished = false;
let guesses = [
  ["bread", "potato"],
  ["mushroom", "pinetree"],
  ["lollipop", "cotton candy"],
  ["snowman", "eight figure"]
];
let choices;
let correctChoice;
let userChoice;
let timeElapsed = NaN;
let turn;

window.onload = () => {
  db = firebase.firestore();
  createRoomButton = document.querySelector('#create-room-button');
  joinRoomButton = document.querySelector('#join-room-button');
  messageP = document.querySelector('#message-p');
  roomCodeInput = document.querySelector('#room-code-input');
  leftChoiceButton = document.querySelector('#right-choice-button');
  rightChoiceButton = document.querySelector('#left-choice-button');

  createRoomButton.onclick = () => {
    db.collection("rooms").add({
      status: "created"
    }).then(docRef => {
      roomDocRef = docRef;
      isCreator = true;
      messageP.innerHTML = "Room Code: " + docRef.id;  
      docRef.onSnapshot(doc => {
        playTurn(doc.data());
      });
    }).catch(error => {
      console.error("Error adding document: ", error);
      messageP.innerHTML("Connection Error, Please Try Again")
    })
  };
  
  joinRoomButton.onclick = () => {
    roomDocRef = db.collection("rooms").doc(roomCodeInput.value);
    
    roomDocRef.get().then(doc => {
      if (doc.exists) {
        isCreator = false;
        console.log("Document data:", doc.data());
        roomDocRef.onSnapshot(doc => {
          playTurn(doc.data());
        });
        roomDocRef.update({
          status: "joined",
          turn: 0,
          points: []
        });
      } else {
        messageP.innerHTML = "Room Does Not Exist";
      }
    }).catch(error => {
      console.log("Error getting document:", error);
      messageP.innerHTML = "Connection Error, Please Try Again";
    });
  }

  rightChoiceButton.onclick = () => {
    userChoice = rightChoiceButton.innerHTML;
    if (rightChoiceButton.innerHTML == correctChoice) {
      win();
    } else {
      lose();
    }
  }

  leftChoiceButton.onclick = () => {
    userChoice = leftChoiceButton.innerHTML;
    if (leftChoiceButton.innerHTML == correctChoice) {
      win();
    } else {
      lose();
    }
  }
}

