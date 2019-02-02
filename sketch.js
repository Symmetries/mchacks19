
let video;
let poseNet;
let poses = [];
let skeletons = [];
let colour;
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


function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detectedgit
  poseNet.on('pose', function (results) {
    poses = results;
    //console.log(poses);
  });
   //console.log(poseNet);
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function draw() {
  colour = 51;
  //image(video, 0, 0, width, height);
  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
}

// A function to draw ellipses over the detected keypoints
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

      let curAvgX = width - bestPosRX;
      let curAvgY = bestPosRY;
      let curPredX = width - poses[0].pose.keypoints[10].position.x;
      let curPredY = poses[0].pose.keypoints[10].position.y;



      fill(255, 0, 0);
      noStroke();
      //print Actuall pos
      fill(0);
      // ellipse(poses[0].pose.keypoints[9].position.x,poses[0].pose.keypoints[9].position.y,10); // left
      fill(0);
      // ellipse(width - poses[0].pose.keypoints[10].position.x,poses[0].pose.keypoints[10].position.y,10); // right
      //print bestPos
      fill(255, 204, 0);
      ellipse(width-bestPosRX,bestPosRY,10);
      fill(255, 204, 0);
      // ellipse(width-bestPosLX,bestPosLY,30);


      if (lastAvgX != NaN) {
        strokeWeight(10);
        stroke(255, 204, 0);
        line(lastAvgX,lastAvgY, curAvgX, curAvgY);
        //stroke(0);
        //line(lastPredX, lastPredY, curPredX, curPredY);
      }
      lastAvgX = curAvgX;
      lastAvgY = curAvgY;
      lastPredX = curPredX;
      lastPredY = curPredY;

    
      

      if (random() < 0.001) print(frameRate());
      // if(random()<0,01){
      //   print(right_hand_X);
      // }

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

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    // For every skeleton, loop through all body connections
    for (let j = 0; j < poses[i].skeleton.length; j++) {
      let partA = poses[i].skeleton[j][0];
      let partB = poses[i].skeleton[j][1];
      stroke(255, 0, 0);
      // line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}
