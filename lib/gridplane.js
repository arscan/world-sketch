let THREE = require('three');

class GridPlane {

  constructor(scene) {
    this.lastTime = 0;

    let texture = new THREE.TextureLoader().load( "assets/graph.jpg" );

    let planeGeometry = new THREE.PlaneGeometry( 100, 100, 20);
    let planeMaterial = new THREE.MeshBasicMaterial( {map: texture, color: 0xffffff, side: THREE.DoubleSide} );
    this.plane = new THREE.Mesh( planeGeometry, planeMaterial );

    planeGeometry.rotateX(Math.PI/2);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 128, 128 );

    scene.add( this.plane );
  }

  animate(time){
    // this.plane.position.z -= .001;


  }

}

export default GridPlane;
