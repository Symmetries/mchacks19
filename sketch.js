
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
  //video.hide();
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
      //TODO: supdate left too 

      let curAvgX = width - curbestPosRX;
      let curAvgY = curbestPosRY;
      // let curPredX = width - poses[0].pose.keypoints[10].position.x;
      // let curPredY = poses[0].pose.keypoints[10].position.y;



      fill(255, 0, 0);
      noStroke();
      //print Actuall pos
      fill(0);
      // ellipse(poses[0].pose.keypoints[9].position.x,poses[0].pose.keypoints[9].position.y,10); // left
      fill(0);
      // ellipse(width - poses[0].pose.keypoints[10].position.x,poses[0].pose.keypoints[10].position.y,10); // right
      //print bestPos
      fill(255, 204, 0);
      ellipse(width-curbestPosRX,curbestPosRY,10);
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
      // lastPredX = curPredX;
      // lastPredY = curPredY;

    
      

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

//attempt one to make the lines smoother...
function attempt1(mx,my,x1,y1,x2,y2){
  // var avX=0;
  // var avY=0;
  // var curX = x[0];
  // var curY = y[0];
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
  var dist1 = dist(mx,my,x1,y1);// sqrt(pow(mx-x1,2) + pow(my-y1,2));
  var dist2 = dist(mx,my,x2,y2);//(sqrt(pow(mx-x2,2) + pow(my-y2,2));
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
