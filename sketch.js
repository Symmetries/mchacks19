let sketchFunction = s => {
  let video;
  let poseNet;
  let poses = [];
  let skeletons = [];
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


  s.setup = () => {
    console.log("Sketch Setup() function")
    s.createCanvas(640, 480);
    video = s.createCapture(s.VIDEO);
    video.size(s.width, s.height);

    poseNet = ml5.poseNet(video, modelReady);
    poseNet.on('pose', function (results) {
      poses = results;
    });
    video.hide();
    button = s.createButton('end');
    button.mousePressed(() => s.remove());
  }

  function modelReady() {
    s.select('#status').html('Model Loaded');
  }

  s.draw = () => {
    drawKeypoints();
  }

  function drawKeypoints()  {
    let bestPosRX;
    let bestPosLX;
    let bestPosRY;
    let bestPosLY;

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
        bestPosRX=averageW(right_hand_X,right_hand_score_X);
        bestPosLX=averageW(left_hand_X, left_hand_score_X);
        bestPosRY=averageW(right_hand_Y, right_hand_score_Y);
        bestPosLY=averageW(left_hand_Y, left_hand_score_Y);

        let curAvgX = s.width - bestPosRX;
        let curAvgY = bestPosRY;
        let curPredX = s.width - poses[0].pose.keypoints[10].position.x;
        let curPredY = poses[0].pose.keypoints[10].position.y;

        s.fill(255, 0, 0);
        s.noStroke();
        // draw predited pos
        s.fill(0);
        // ellipse(poses[0].pose.keypoints[9].position.x,poses[0].pose.keypoints[9].position.y,10); // left
        s.fill(0);
        // ellipse(s.width - poses[0].pose.keypoints[10].position.x,poses[0].pose.keypoints[10].position.y,10); // right
        // draw bestPos
        // fill(255, 204, 0);
        // ellipse(s.width-bestPosLX,bestPosLY,30);


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
        av = av + score[i]*pos[i];// * pow(2, -i);
        s = s + score[i];
    }
    return av/s;
  }
}

window.onload = () => {
  let db = firebase.firestore();
  let startButton = document.querySelector('#start-button');
  let createRoomButton = document.querySelector('#create-room-button');
  let joinRoomButton = document.querySelector('#join-room-button');
  let roomCodeP = document.querySelector('#room-code-p');
  let roomCodeInput = document.querySelector('#room-code-input');

  startButton.onclick = e => {
    let p5Sketch = new p5(sketchFunction, 'p5sketch');
    console.log("Start Button on click event");
  };
  console.log("window.onload");
  createRoomButton.onclick = e => {
    db.collection("rooms").add({
      creator: "test"
    }).then(docRef => {
      console.log("Document written with ID: ", docRef.id);
      roomCodeP.innerHTML = "Room Code: " + docRef.id;  
    }).catch(error => {
      console.error("Error adding document: ", error);
    })
  };
  
  joinRoomButton.onclick = e => {
    let roomDocRef = db.collection("rooms").doc(roomCodeInput.value);
    
    roomDocRef.get().then(doc => {
      if (doc.exists) {
        console.log("Document data:", doc.data());
      } else {
        console.log("No such document!");
      }
    }).catch(error => {
      console.log("Error getting document:", error);
    });
  }
}
