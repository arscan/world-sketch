import USA from './usa'
import GridPlane from './gridplane'
import TWEEN from 'tween.js';
require('event-source-polyfill');
let THREE = require('three');
require('three-obj-loader')(THREE);

// INIT
let lastTime = -.000001;

let renderer = new THREE.WebGLRenderer( { antialias: true, canvas: document.getElementById('render') } );
renderer.setSize( 1920, 1080 );

let scene = new THREE.Scene();

// plane.translateY(-.4);

let camera = new THREE.PerspectiveCamera( 70, 1920/1080, 0.01, 10 );
camera.position.y = .7;
camera.position.z = .9;
camera.lookAt(new THREE.Vector3(0,0,0));
camera.position.y = .9;

   // {type: 'birth'},                                                                                                                                                               
//     8   // {type: 'death'},
//         9   // {type: 'condition-onset'},
//            10   // {type: 'condition-abatement'},
//               11   // {type: 'procedure'},
//                  12   // {type: 'encounter'}
//



let  light = new THREE.HemisphereLight( 0xffffff, 0x000000, 1 );
light.position.set(0,.5,0);
scene.add( light );

let pointGeometry = new THREE.Geometry();
let textureLoader = new THREE.TextureLoader();

let pointSprite = textureLoader.load( "assets/point_sprite.png" );

for ( let i = 0; i < 500; i ++ ) {

  var vertex = new THREE.Vector3();
  vertex.x = Math.random() * 2 - 1;
  vertex.y = -.05;
  vertex.z = Math.random() * 2 - 1;

  pointGeometry.vertices.push( vertex );

}

let material = new THREE.PointsMaterial( { size: .05, map: pointSprite/*, blending: THREE.AdditiveBlending, depthTest: false,*/, transparent : true } );
material.color.setRGB( .3, .6, .9);

let particles = new THREE.Points( pointGeometry, material);

// particles.rotation.x = Math.random() * 6;
// particles.rotation.y = Math.random() * 6;
// particles.rotation.z = Math.random() * 6;

scene.add( particles );

let es = new EventSourcePolyfill('http://synthea-stream.robscanlon.com/events?eps=10')

let currentPoint = 0;

let listener = function (event) {
  let data = JSON.parse(event.data)
  currentPoint++;
  currentPoint = currentPoint % pointGeometry.vertices.length;
  pointGeometry.vertices[currentPoint].y = .05;
  if(data.lon){
    pointGeometry.vertices[currentPoint].x = (((70+data.lon)/-50) - .5) * 2;
    pointGeometry.vertices[currentPoint].z = (((data.lat-31)/17) - .5) * 2;
  }
  // cons
  pointGeometry.verticesNeedUpdate = true;
  console.log(currentPoint);
  // var div = document.createElement("div");
  // var type = event.type;
  // console.log(event.data);
  // div.appendChild(document.createTextNode(type + ": " + (type === "message" ? event.data : es.url)));
  // document.body.appendChild(div);
};


es.addEventListener("message", listener);

let clear = () => {
  pointGeometry.vertices.forEach((item) => {
    item.y = -.5;

  })

  pointGeometry.verticesNeedUpdate = true;

}

let usa = new USA(scene, clear);
let gridPlane = new GridPlane(scene);

function animate(time) {
  time = time || 0;

  [usa, gridPlane].forEach(s => s.animate(time))

  TWEEN.update();
  lastTime = time;
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}

animate();
