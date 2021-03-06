import USA from './usa'
import GridPlane from './gridplane'
import TWEEN from 'tween.js';
import ParticleSystem from './particlesystem'
import PeopleSystem from './peoplesystem'
import moment from 'moment'
import Stats from 'stats.js'
require('event-source-polyfill');
let THREE = require('three');
require('three-obj-loader')(THREE);

let viewState = 'map';

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
let peopleSystem = new PeopleSystem(scene);
peopleSystem.setSpeed(.0002 * (epsQP/50) );

let es = new EventSourcePolyfill('http://synthea-stream.robscanlon.com/events?eps=' + eps)
// let es = new EventSourcePolyfill('http://localhost:1337/events?eps=' + eps)

let currentPoint = {};
let counters = {}

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

    if(viewState === 'map'){

      particleSystem.geometry.attributes.position.array[particleSystem.currentIndex * 3] = (((70+data.lon)/-50) - .5) * 2;
      particleSystem.geometry.attributes.position.array[particleSystem.currentIndex * 3 + 1] = .05
      particleSystem.geometry.attributes.position.array[particleSystem.currentIndex * 3 + 2] = (((data.lat-31)/17) - .5) * 2 / 1.6;
      particleSystem.geometry.attributes.customColor.array[particleSystem.currentIndex * 3] = colors[data.type].r;
      particleSystem.geometry.attributes.customColor.array[particleSystem.currentIndex * 3 + 1] = colors[data.type].g; 
      particleSystem.geometry.attributes.customColor.array[particleSystem.currentIndex * 3 + 2] = colors[data.type].b;
      particleSystem.geometry.attributes.startTime.array[particleSystem.currentIndex] = thisTime();

      particleSystem.incrementIndex();
    }

    if(viewState === 'people'){

      peopleSystem.geometry.attributes.position.array[peopleSystem.currentIndex * 3] = -1 + (peopleSystem.currentIndex%25)/12.5;
      peopleSystem.geometry.attributes.position.array[peopleSystem.currentIndex * 3 + 1] = -.05
      // peopleSystem.geometry.attributes.position.array[particleSystem.currentIndex * 3 + 2] = -3 + Math.floor(particleSystem.currentIndex / 25) / 10;
      peopleSystem.geometry.attributes.position.array[peopleSystem.currentIndex * 3 + 2] = 1;

      peopleSystem.geometry.attributes.customColor.array[peopleSystem.currentIndex * 3] = colors[data.type].r;
      peopleSystem.geometry.attributes.customColor.array[peopleSystem.currentIndex * 3 + 1] = colors[data.type].g; 
      peopleSystem.geometry.attributes.customColor.array[peopleSystem.currentIndex * 3 + 2] = colors[data.type].b;
      peopleSystem.geometry.attributes.startTime.array[peopleSystem.currentIndex] = thisTime();

      peopleSystem.incrementIndex();
    }


    // console.log(Date.now());
    // console.log(particleSystem.currentIndex);


    // pointGeometries[data.type].vertices[currentPoint[data.type]].x = (((70+data.lon)/-50) - .5) * 2;
    // pointGeometries[data.type].vertices[currentPoint[data.type]].z = (((data.lat-31)/17) - .5) * 2 / 1.6;
    // console.log(particleSystem);
    // currentPoint[data.type]++;
    // currentPoint[data.type] = currentPoint[data.type] % pointGeometries[data.type].vertices.length;
    // pointGeometries[data.type].vertices[currentPoint[data.type]].y = .05;
    // pointGeometries[data.type].vertices[currentPoint[data.type]].x = (((70+data.lon)/-50) - .5) * 2;
    // pointGeometries[data.type].vertices[currentPoint[data.type]].z = (((data.lat-31)/17) - .5) * 2 / 1.6;
    // cons
    // pointGeometries[data.type].verticesNeedUpdate = true; // var div = document.createElement("div"); // var type = event.type;
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

document.getElementById("map-view").onclick = function(event){
  event.preventDefault();
  if(!usa.object || !particleSystem.particleSystem || !peopleSystem.particleSystem){
    return
  }
  usa.object.visible = true;
  particleSystem.particleSystem.visible=true;
  peopleSystem.particleSystem.visible=false;
  viewState = 'map';

}

document.getElementById("people-view").onclick = function(event){
  event.preventDefault();
  if(!usa.object || !particleSystem.particleSystem || !peopleSystem.particleSystem){
    return
  }
  peopleSystem.resetAll();
  usa.object.visible = false;
  particleSystem.particleSystem.visible=false;
  peopleSystem.particleSystem.visible=true;
  viewState = 'people';
}

function animate() {
  // time = Date.now();

  if(viewState === 'map'){
    [usa,particleSystem].forEach(s => s.animate(thisTime()))
  }

  if(viewState === 'people'){
    [peopleSystem].forEach(s => s.animate(thisTime()))

  }
  gridPlane.animate(thisTime());

  TWEEN.update();
  lastTime = thisTime();
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
  document.getElementById('time').innerHTML = moment().format('MMMM D YYYY, h:mm:ss a');
  stats.update();
}


animate();
