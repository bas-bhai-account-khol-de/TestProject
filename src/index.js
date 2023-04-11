const constraints = {
    video: {

      facingMode: "environment"
    }
  };
  const video =document.getElementById('video');

async function getDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
        const updatedConstraints = {
          ...constraints,
        //   deviceId: {
        //     exact: videoDevices[0]
        //   }
        };
        const stream = await navigator.mediaDevices.getUserMedia(updatedConstraints);
        video.srcObject = stream
        video.play();
      }


  }

var Module = {
    onRuntimeInitialized() {
        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
        opencvIsReady();
    }
}




var orb=null
let cap = null;
let frame =null;
    function opencvIsReady(){
        document.getElementById('status').innerHTML="loaded ";
        getDevices();
        cap=new cv.VideoCapture(video);
        orb = new cv.ORB(200);
        frame = new cv.Mat(240,320,cv.CV_8UC4);
        trackimage();
    }


/// image tracking code
var desc_target = null;
var kp_target=null;
var desc_video = null;
var kp_video=null;

//tempp


function trackimage(){

    //requirmnents
    
    getImageFeatures();
    desc_video= new cv.Mat();
    kp_video = new cv.KeyPointVector();
    getVideoFeatures();
    
    
}

function getVideoFeatures(){
    cap.read(frame);
    orb.detectAndCompute(frame,new cv.Mat(),kp_video,desc_video)
    cv.drawKeypoints(frame,kp_video,frame,[0, 255, 0, 255])
    cv.imshow('canvasOutput',frame);
    requestAnimationFrame(getVideoFeatures);
    
}

function getImageFeatures(){
    const image = new Image();
    image.src = './src/target.jpeg'
    image.onload =()=>{
        let mat = cv.imread(image);
        cv.cvtColor(mat,mat,6)
        console.log(cv);
         
         desc_target = new cv.Mat();
         kp_target = new cv.KeyPointVector();
         orb.detectAndCompute(mat,new cv.Mat(),kp_target,desc_target)
         cv.drawKeypoints(mat,kp_target,mat,[0, 255, 0, 255])
        //  cv.imshow('canvasOutput',mat,10,10)
    }
     
}