import USA from './usa'
import GridPlane from './gridplane'
import TWEEN from 'tween.js';
import PatientEvents from './patientEvents'
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


let  light = new THREE.HemisphereLight( 0xffffff, 0x000000, 1 );
light.position.set(0,.5,0);
scene.add( light );

let usa = new USA(scene);
let gridPlane = new GridPlane(scene);
let patientEvents = new PatientEvents();

setInterval(() => {
  let mesh = usa.states[Math.floor(Math.random() * 50)]

  new TWEEN.Tween({y: 0})
               .to({y: .1}, 1000)
               .onUpdate(function(){
                  mesh.position.y = this.y;
                })
               .easing(TWEEN.Easing.Quadratic.InOut)
               .start() // Use an easing function to make the animation smooth. // Create a new tween that modifies 'coords'.

  new TWEEN.Tween({y: .1})
               .to({y: 0}, 1000)
               .onUpdate(function(){
                  mesh.position.y = this.y;
                })
                .delay(2000)
               .easing(TWEEN.Easing.Quadratic.InOut)
               .start() // Use an easing function to make the animation smooth. // Create a new tween that modifies 'coords'.

}, 5000);

function animate(time) {
  time = time || 0;

  [usa, gridPlane].forEach(s => s.animate(time))
  let events = patientEvents.tick(time);
  events.forEach((item) => {
    console.log(item[2]);
  });

  TWEEN.update();
  lastTime = time;
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}

animate();
