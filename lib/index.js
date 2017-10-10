import USA from './usa'
import GridPlane from './gridplane'
import TWEEN from 'tween.js';
require('event-source-polyfill');
let THREE = require('three');
require('three-obj-loader')(THREE);

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

let eps = 10;
let epsQP = getParameterByName('eps');

if(epsQP != null){
  eps = epsQP;
}

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

let textureLoader = new THREE.TextureLoader();

let pointSprite = textureLoader.load( "assets/point_sprite.png" );

let materials = {};
let pointGeometries = {};

let types = ['birth', 'death', 'condition-onset', 'condition-abatement', 'procedure', 'encounter']
let colors ={
  'birth': 0xff70e2,
  'death': 0x1e90ff,
  'condition-onset': 0xe32434,
  'condition-abatement': 0x607d14,
  'procedure': 0xf1a811,
  'encounter': 0x336699 

}

types.forEach((type) =>{

  materials[type] = new THREE.PointsMaterial( { size: .05, map: pointSprite/*, blending: THREE.AdditiveBlending, depthTest: false,*/, transparent : true } );
  materials[type].color = new THREE.Color(colors[type]);
  pointGeometries[type] = new THREE.Geometry();

  for ( let i = 0; i < 300; i ++ ) {

    var vertex = new THREE.Vector3(0, -1, 0);

    pointGeometries[type].vertices.push( vertex );
    scene.add(new THREE.Points(pointGeometries[type], materials[type]));

  }

});

// let particles = new THREE.Points( pointGeometries, material);

// particles.rotation.x = Math.random() * 6;
// particles.rotation.y = Math.random() * 6;
// particles.rotation.z = Math.random() * 6;

// scene.add( particles );

let es = new EventSourcePolyfill('http://synthea-stream.robscanlon.com/events?eps=' + eps)

let currentPoint = {};
let counters = {}

types.forEach((type) => {
  currentPoint[type] = 0;
  counters[type] = 0;
});

let listener = function (event) {
  let data = JSON.parse(event.data)

  if(currentPoint[data.type] !== undefined){
    counters[data.type]++;
    document.getElementById(data.type + '-counter').innerHTML = counters[data.type];
    currentPoint[data.type]++;
    currentPoint[data.type] = currentPoint[data.type] % pointGeometries[data.type].vertices.length;
    pointGeometries[data.type].vertices[currentPoint[data.type]].y = .05;
    pointGeometries[data.type].vertices[currentPoint[data.type]].x = (((70+data.lon)/-50) - .5) * 2;
    pointGeometries[data.type].vertices[currentPoint[data.type]].z = (((data.lat-31)/17) - .5) * 2 / 1.6;
    // cons
    pointGeometries[data.type].verticesNeedUpdate = true;
    // var div = document.createElement("div");
    // var type = event.type;
    // div.appendChild(document.createTextNode(type + ": " + (type === "message" ? event.data : es.url)));
    // document.body.appendChild(div);


  }
  console.log(data);

};


es.addEventListener("message", listener);

let clear = () => {
  types.forEach((type) => {
    pointGeometries[type].vertices.forEach((item) => {
      item.y = -.5;

    })

    pointGeometries[type].verticesNeedUpdate = true;

  })
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
