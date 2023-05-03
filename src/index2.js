var Module = {
    onRuntimeInitialized() {
        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
        opencvIsReady();
    }
}

function opencvIsReady(){const image = new Image();
    image.src = './src/target.jpeg'
    image.onload =()=>{
// Load the input image
const ref_img = cv.imread(image);
const cur_img = cv.imread(image);

const ref_gray = new cv.Mat();
const cur_gray = new cv.Mat();
cv.cvtColor(ref_img, ref_gray, cv.COLOR_BGR2GRAY);
cv.cvtColor(cur_img, cur_gray, cv.COLOR_BGR2GRAY);

const sift = new cv.ORB(200);
const kp1 = new cv.KeyPointVector();
const des1 = new cv.Mat();
sift.detectAndCompute(ref_gray, new cv.Mat(), kp1, des1);
const kp2 = new cv.KeyPointVector();
const des2 = new cv.Mat();
sift.detectAndCompute(cur_gray, new cv.Mat(), kp2, des2);

const flann = new cv.BFMatcher();
const matches = new cv.DMatchVectorVector();
flann.knnMatch(des1, des2, matches, 2);

const good_matches = [];
for (let i = 0; i < matches.size(); i++) {
  const m = matches.get(i, 0);
  const n = matches.get(i, 1);
  if (m.distance < 0.7 * n.distance) {
    good_matches.push(m);
  }
}

const src_pts = new cv.Mat();
const dst_pts = new cv.Mat();
const mask = new cv.Mat();
if (good_matches.length > 4) {
  src_pts.create(good_matches.length, 1, cv.CV_32FC2);
  dst_pts.create(good_matches.length, 1, cv.CV_32FC2);
  for (let i = 0; i < good_matches.length; i++) {
    const m = good_matches[i];
    src_pts.data32F[i * 2] = kp1.get(m.queryIdx).pt.x;
    src_pts.data32F[i * 2 + 1] = kp1.get(m.queryIdx).pt.y;
    dst_pts.data32F[i * 2] = kp2.get(m.trainIdx).pt.x;
    dst_pts.data32F[i * 2 + 1] = kp2.get(m.trainIdx).pt.y;
  }
  const H = new cv.Mat();
  cv.findHomography(src_pts, dst_pts, H, cv.RANSAC, 5.0, mask);
} else {
  throw new Error('Not enough matches found');
}

const K = cv.matFromArray(3, 3, cv.CV_32F, [1000, 0, ref_img.cols/2, 0, 1000, ref_img.rows/2, 0, 0, 1]);  // Camera intrinsic matrix
const H_inv = new cv.Mat();
cv.invert(H, H_inv);
const Rt = new cv.Mat();
cv.decomposeHomographyMat(H_inv, K, Rt);
const R = new cv.Mat();
cv.Rodrigues(Rt.rowRange(0, 3).colRange(0, 3), R);
const t = new cv.Mat();
Rt.rowRange(0, 3).col(3).copyTo(t);

console.log('Rotation matrix:');
console.log(R);
console.log('Translation vector:');
console.log(t);

}}