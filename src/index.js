


const constraints = {
    video: {

      facingMode: "environment"
    }
  };
  const video =document.getElementById('video');

async function getDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    // //consloe.log(devices);
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
let matcher=null;
    function opencvIsReady(){
        document.getElementById('status').innerHTML="loaded ";
        getDevices();
        cap=new cv.VideoCapture(video);
        orb = new cv.ORB(200);
        matcher = new cv.BFMatcher()
        frame = new cv.Mat(240,320,cv.CV_8UC4);
        trackimage();
    }


/// image tracking code
var desc_target = null;
var kp_target=null;
var desc_video = null;
var kp_video=null;
let matches =null;
//tempp


function trackimage(){

    //requirmnents
    desc_target = new cv.Mat();
    kp_target = new cv.KeyPointVector();
    getImageFeatures();
    desc_video= new cv.Mat();
    kp_video = new cv.KeyPointVector();
    matches = new cv.DMatchVectorVector();
    getVideoFeatures();
    
    
}


function matchFeatures(){
   try {
    matches = new cv.DMatchVectorVector();
    matcher.knnMatch(desc_target,desc_video,matches,2)
    // //consloe.log(matches);
    let good_matches = new cv.DMatchVector();
    for (let i = 0; i < matches.size(); ++i){
        let match = matches.get(i);
                    let dMatch1 = match.get(0);
                    let dMatch2 = match.get(1);
                    if (dMatch1.distance <= dMatch2.distance * 0.8) {
                        good_matches.push_back(dMatch1);
                    }
    }
    matches.delete();
    let points1 = [];
    let points2 = [];
    for (let i = 0; i < good_matches.size(); i++) {
        try{
            points1.push(kp_target.get(good_matches.get(i).queryIdx).pt.x);
            points1.push(kp_target.get(good_matches.get(i).queryIdx).pt.y);
            points2.push(kp_video.get(good_matches.get(i).trainIdx).pt.x);
            points2.push(kp_video.get(good_matches.get(i).trainIdx).pt.y);
        
        }
            catch(e){
                console.log('error',e);
            }

    }
    // console.log('goog matchces',good_matches.size());
    good_matches.delete();
    // console.log(points1);
    points1 = points1.filter((item)=>{return item!==NaN;})
    points2 = points2.filter((item)=>{return item!==NaN;})
    let mat1 = cv.matFromArray(points1.length, 3, cv.CV_32F, points1);
    let mat2 = cv.matFromArray(points2.length, 3, cv.CV_32F, points2);
    // console.log('after',points1);
    // console.log('mats',mat1.data32F,mat2.data32F);
    let h = cv.findHomography(mat1, mat2, cv.RANSAC);
    let pose  =  homographyTo3d(h);
    //consloe.log('homogrphy',h);
    console.log('pose',pose);

    // good_matches.delete();
   } catch (error) {
    console.log(error)
   }
   
}

function getVideoFeatures(){
    cap.read(frame);
    orb.detectAndCompute(frame,new cv.Mat(),kp_video,desc_video)
    matchFeatures()
    cv.drawKeypoints(frame,kp_video,frame,[0, 255, 0, 255])
    cv.imshow('canvasOutput',frame);
    requestAnimationFrame(getVideoFeatures);
    
}


function homographyTo3d(H){
    // Compute the pose of the object in 3D space using the homography matrix
var fx = 0.5;
const K = [  [320*fx, 0, 320*fx],
[0, 320*fx, 240*fx],
[0, 0, 1]
]; // camera intrinsic matrix
var h =[  H.data32F[0], H.data32F[1], H.data32F[2],
H.data32F[3], H.data32F[4], H.data32F[5],
H.data32F[6], H.data32F[7], H.data32F[8]
];
var Hmat = new THREE.Matrix3();
Hmat.elements = h;
var HmatInv =  new  THREE.Matrix3();
HmatInv.elements = h;
HmatInv= HmatInv.invert();
var pos =  new THREE.Vector3(0,0,1);
const result = new THREE.Vector3();
result.copy(pos).applyMatrix3(HmatInv);
console.log(result);
const transform = new THREE.Matrix4();
transform.set(
    h[0], h[3], 0, h[6],
    h[1], h[4], 0, h[7],
    0, 0, 1, 0,
    h[2], h[5], 0, 1
  );
  console.log(h);
  return transform;
// const r1 = new THREE.Vector3().crossVectors()


// console.log(h,H.data64F,Hmat.toArray(),HmatInv.toArray());

// const Hinv = new cv.Mat()

//  cv.invert(cv.matFromArray(3, 3, cv.CV_64FC1, [  H.data32F[0], H.data32F[1], H.data32F[2],
// H.data32F[3], H.data32F[4], H.data32F[5],
// H.data32F[6], H.data32F[7], H.data32F[8]
// ]),Hinv)
// // console.log('incverse',Hinv);
// const h1 = cv.matFromArray(3, 1, cv.CV_64FC1, [0, 0, 1]);
// let h2 = new cv.Mat();
// // h2 = cv.Mat.mul(Hinv,h1);
// // cv.matMul(Hinv, h1, h2);
// cv.gemm(Hinv, h1, 1, new cv.Mat(), 0, h2, 0);
// // const mat = new cv.Mat(3, 3, cv.CV_8UC3);
// // mat.setTo(new cv.Scalar(1, 1, 1));
// //  cv.multiply(Hinv, mat, h2)
// console.log('h2',h2);
// const h2Norm = norm(h2);
// const r1 = h2.cross(cv.matFromArray(3, 1, cv.CV_64FC1, [0, 0, -1])).div(h2Norm);
// const r2 = h2.cross(r1).div(h2Norm);
// const r3 = r1.cross(r2);
// const R = cv.matFromArray(3, 3, cv.CV_64FC1, [  r1.data64F[0], r2.data64F[0], r3.data64F[0],
// r1.data64F[1], r2.data64F[1], r3.data64F[1],
// r1.data64F[2], r2.data64F[2], r3.data64F[2]
// ]);
// const t = cv.matFromArray(3, 1, cv.CV_64FC1, [  Hinv.data64F[2], Hinv.data64F[5], Hinv.data64F[8]
// ]).div(h2Norm);
// const pose = {
// x: -t.data64F[0],
// y: -t.data64F[1],
// z: -t.data64F[2],
// rx: -Math.atan2(R.data64F[7], R.data64F[8]),
// ry: -Math.atan2(-R.data64F[6], Math.sqrt(R.data64F[7] ** 2 + R.data64F[8] ** 2)),
// rz: -Math.atan2(R.data64F[3], R.data64F[0])
// };

///
// {
//     let Hinv = new cv.Mat();
// cv.invert(H, Hinv);

// // Compute extrinsic parameters from homography matrix
// const lambda = 1.0 / (cv.norm(cv.matFromArray(2, 1, cv.CV_64FC1, [Hinv.data64F[6], Hinv.data64F[7]])) + cv.norm(cv.matFromArray(2, 1, cv.CV_64FC1, [Hinv.data64F[0], Hinv.data64F[1]]))) / 2.0;
// const r1 = cv.matFromArray(3, 1, cv.CV_64FC1, [lambda * Hinv.data64F[0], lambda * Hinv.data64F[1], lambda * Hinv.data64F[2]]);
// const r2 = cv.matFromArray(3, 1, cv.CV_64FC1, [lambda * Hinv.data64F[3], lambda * Hinv.data64F[4], lambda * Hinv.data64F[5]]);
// const r3 = r1.matCross(r2);
// const t = cv.matFromArray(3, 1, cv.CV_64FC1, [lambda * Hinv.data64F[6], lambda * Hinv.data64F[7], lambda * Hinv.data64F[8]]);
// const R = cv.matFromArray(3, 3, cv.CV_64FC1, [
//   r1.data64F[0], r2.data64F[0], r3.data64F[0],
//   r1.data64F[1], r2.data64F[1], r3.data64F[1],
//   r1.data64F[2], r2.data64F[2], r3.data64F[2]
// ]);

// // Compute rotation angles in degrees
// const rx = -Math.atan2(R.data64F[7], R.data64F[8]) * 180 / Math.PI;
// const ry = -Math.atan2(-R.data64F[6], Math.sqrt(R.data64F[7] ** 2 + R.data64F[8] ** 2)) * 180 / Math.PI;
// const rz = -Math.atan2(R.data64F[3], R.data64F[0]) * 180 / Math.PI;

// // Compute translation in camera coordinates
// const t_cam = t.clone().mul(-1); // Negate t for camera coordinates
// const t_x = t_cam.data64F[0] / fx;
// const t_y = t_cam.data64F[1] / fx;
// const t_z = t_cam.data64F[2];

// }

// const pose = cv.decomposeHomographyMat(H, K);
// return {r:[rx,ry,rz],t:[t_x,t_y,t_z]};
}


function norm(mat) {
    var sum = 0;
    var n = mat.cols * mat.rows;
    var data = mat.data32F || mat.data64F;
    for (var i = 0; i < n; ++i) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum);
  }
  

function getImageFeatures(){
    const image = new Image();
    image.src = './src/target.jpeg'
    image.onload =()=>{
        let mat = cv.imread(image);
        cv.cvtColor(mat,mat,6)
        // //consloe.log(cv);
         
        
         orb.detectAndCompute(mat,new cv.Mat(),kp_target,desc_target)
         cv.drawKeypoints(mat,kp_target,mat,[0, 255, 0, 255])
        //  cv.imshow('canvasOutput',mat,10,10)
    }
     

}