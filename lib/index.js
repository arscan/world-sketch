import USA from './usa'
import GridPlane from './gridplane'
import TWEEN from 'tween.js';
import ParticleSystem from './particlesystem'
import moment from 'moment'
import Stats from 'stats.js'
require('event-source-polyfill');
let THREE = require('three');
require('three-obj-loader')(THREE);

var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
let currentPopulation = 345456231;

let globalStartTime = Date.now();

function thisTime() {
  return Date.now() - globalStartTime;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

document.getElementById('eps-count').innerHTML = epsQP;

// INIT
let lastTime = -.000001;

let renderer = new THREE.WebGLRenderer( { antialias: true, canvas: document.getElementById('render') } );
renderer.setSize( 1920, 1080 );

let scene = new THREE.Scene();

// plane.translateY(-.4);

let camera = new THREE.PerspectiveCamera( 70, 1920/1080, 0.01, 10 );
camera.position.y = 1;
camera.position.z = 1.2;
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
  'birth': new THREE.Color(0xff70e2),
  'death': new THREE.Color(0x1e90ff),
  'condition-onset': new THREE.Color(0xe32434),
  'condition-abatement': new THREE.Color(0x607d14),
  'procedure': new THREE.Color(0xf1a811),
  'encounter': new THREE.Color(0x336699) 

}

// types.forEach((type) =>{
// 
//   materials[type] = new THREE.PointsMaterial( { size: .05, map: pointSprite/*, blending: THREE.AdditiveBlending, depthTest: false,*/, transparent : true } );
//   materials[type].color = new THREE.Color(colors[type]);
//   pointGeometries[type] = new THREE.Geometry();
// 
//   for ( let i = 0; i < 300; i ++ ) {
// 
//     var vertex = new THREE.Vector3(0, -1, 0);
// 
//     pointGeometries[type].vertices.push( vertex );
//     scene.add(new THREE.Points(pointGeometries[type], materials[type]));
// 
//   }
// 
// });

// let particles = new THREE.Points( pointGeometries, material);

// particles.rotation.x = Math.random() * 6;
// particles.rotation.y = Math.random() * 6;
// particles.rotation.z = Math.random() * 6;

// scene.add( particles );

let particleSystem = new ParticleSystem(scene);

let es = new EventSourcePolyfill('http://synthea-stream.robscanlon.com/events?eps=' + eps)
// let es = new EventSourcePolyfill('http://localhost:1337/events?eps=' + eps)

let currentPoint = {};
let counters = {}
let totalCounter = 0;

types.forEach((type) => {
  currentPoint[type] = 0;
  counters[type] = 0;
});

let listener = function (event) {
  let data = JSON.parse(event.data)

  if(data.type == 'meta-connect'){
    document.getElementById('connection-count').innerHTML = data.size;
  }

  if(!usa.loaded){
    return;
  }

  if(data.type == 'death'){

    currentPopulation--;
    document.getElementById('population-count').innerHTML = numberWithCommas(currentPopulation);
  }

  if(data.type == 'birth'){
    currentPopulation++;
    document.getElementById('population-count').innerHTML = numberWithCommas(currentPopulation);
  }

  if(currentPoint[data.type] !== undefined){

    counters[data.type]++;
    document.getElementById(data.type + '-counter').innerHTML = counters[data.type];
    particleSystem.geometry.attributes.position.array[totalCounter * 3] = (((70+data.lon)/-50) - .5) * 2;
    particleSystem.geometry.attributes.position.array[totalCounter * 3 + 1] = .05
    particleSystem.geometry.attributes.position.array[totalCounter * 3 + 2] = (((data.lat-31)/17) - .5) * 2 / 1.6;
//   materials[type].color = new THREE.Color(colors[type]);
    particleSystem.geometry.attributes.customColor.array[totalCounter * 3] = colors[data.type].r;
    particleSystem.geometry.attributes.customColor.array[totalCounter * 3 + 1] = colors[data.type].g; 
    particleSystem.geometry.attributes.customColor.array[totalCounter * 3 + 2] = colors[data.type].b;
    particleSystem.geometry.attributes.startTime.array[totalCounter] = thisTime();
    totalCounter++;
    totalCounter =totalCounter % 1000;

    // console.log(Date.now());
    // console.log(totalCounter);


    // pointGeometries[data.type].vertices[currentPoint[data.type]].x = (((70+data.lon)/-50) - .5) * 2;
    // pointGeometries[data.type].vertices[currentPoint[data.type]].z = (((data.lat-31)/17) - .5) * 2 / 1.6;
    // console.log(particleSystem);
    // currentPoint[data.type]++;
    // currentPoint[data.type] = currentPoint[data.type] % pointGeometries[data.type].vertices.length;
    // pointGeometries[data.type].vertices[currentPoint[data.type]].y = .05;
    // pointGeometries[data.type].vertices[currentPoint[data.type]].x = (((70+data.lon)/-50) - .5) * 2;
    // pointGeometries[data.type].vertices[currentPoint[data.type]].z = (((data.lat-31)/17) - .5) * 2 / 1.6;
    // cons
    // pointGeometries[data.type].verticesNeedUpdate = true;
    // var div = document.createElement("div");
    // var type = event.type;
    // div.appendChild(document.createTextNode(type + ": " + (type === "message" ? event.data : es.url)));
    // document.body.appendChild(div);


  }
  // console.log(data);

};

function listenerDelay(event){
  setTimeout(()=>{listener(event)}, Math.random() * 3000);
}


es.addEventListener("message", listenerDelay);

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

function animate() {
  // time = Date.now();

  [usa,particleSystem, gridPlane].forEach(s => s.animate(thisTime()))

  TWEEN.update();
  lastTime = thisTime();
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
  document.getElementById('time').innerHTML = moment().format('LLL')
  stats.update();
}


animate();
