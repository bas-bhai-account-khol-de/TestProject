
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;
// camera.rotation.set(0,3.14,0);
const renderer = new THREE.WebGLRenderer( { alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Create the cube geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Create the material
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// Create the mesh and add it to the scene
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

animate()
function animate()
{
    // cube.rotateX(20);
    renderer.render(scene, camera);
    console.log("hi")
    window.Unity.call("hi");
    requestAnimationFrame(animate);
}
window.receive = function(msg){
    var loc =JSON.parse(msg);
    console.log(loc)
    cube.rotateX(20);
    cube.position.set(-1*parseFloat(loc.px),-1*parseFloat(loc.pz),1*parseFloat(loc.py));
    camera.position.set(-1*parseFloat(loc.pcx),-1*parseFloat(loc.pcz),1*parseFloat(loc.pcy));
    animate()
}