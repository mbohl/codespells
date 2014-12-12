// CodeSpells
// Logic to render Worlds
var container;

var camera, controls, scene, renderer;

var scale = 10.5;
var cubeGroup;
var angularSpeed = 0.2; 
var lastTime = 0;

/* 
 README

 World call is:
 Width, Height, Depth, Ratio 1, Ratio 2, Ratio 3, Density 1, Density 2, Density 3

 My x,y,z coordinate plane is probably not standard.. may need to swap them around eventually
 Right now, "1" is air, "2" is water and "3" is bedrock.
 Anything under a density of 4000 will be treated as a non solid.  Liquids and gasses have the same "settling" logic, while solids only move "down" in the z plane.
*/
// Even distribution with little lag
var world = new World(10, 10, 10, 30, 35, 35, 1, 3500, 5000);

// Curtain (shows faults in algorithm that should be corrected)
//var world = new World(10, 1, 60, 50, 20, 30, 1, 3500, 5000);

// What I demo'd for you 
//var world = new World(20, 20, 20, 50, 20, 30, 1, 3500, 5000);

init();
animate();

function init() {


	camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 1, 3000 );
	camera.position.z = 800;

	controls = new THREE.OrbitControls(camera);
	controls.addEventListener('change', render);

	
	scene = new THREE.Scene();
	//scene.fog = new THREE.FogExp2( 0xcccccc, 0.002);

	renderer = new THREE.WebGLRenderer( { antialias: false });
	//renderer.setClearColor ( scene.fog.color, 1);
	renderer.setSize( window.innerWidth, window.innerHeight );

	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener( 'keypress', generateCube );

	//scene.add( camera );
	
	// set a directional light
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 5 );
	directionalLight.position.z = 3;
	scene.add( directionalLight );

	generateCube();
}

function generateCube() {

	scene.remove(cubeGroup);

	// cube geometry (200 x 200 x 200);
	cubeGroup = new THREE.Object3D;
	var geometry = new THREE.BoxGeometry(10, 10, 10);
	var material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
	var material_water = new THREE.MeshBasicMaterial( { color: 0x0033FF, transparent: true, opacity: 0.2, wireframe: true } );
	var material_air = new THREE.MeshBasicMaterial( { color: 0x33CCFF, transparent: true, opacity: 0.5, wireframe: true } );
	//var material_air = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, transparent: true, opacity: 0.5 } );
	var material_bedrock = new THREE.MeshBasicMaterial( { color: 0x505050, wireframe: true } );

	var i,j,k,rand;
	var cubeMesh;
	var material;

	world.settle();

	for (i = 0; i < world.x; i++) {
		for (j = 0; j < world.y; j++) {
			for (k = 0; k < world.z; k++) {

				//rand = Math.floor(Math.random() * 3) + 1;
				rand = world.map[i][j][k].weight;
				if ( rand == 1 ) material = material_air;
				else if (rand == 3500) material = material_water;
				else material = material_bedrock;

				cubeMesh = new THREE.Mesh( geometry, material);
				cubeMesh.position.set(i*scale, j*scale, k*scale);
				cubeGroup.add( cubeMesh );
			}
		}
	}

	// center back on canvas
	cubeGroup.position.set(-i*scale/2,-j*scale/2,-k*scale/2);
	cubeGroup.rotation.x +=1.75;
	//cubeGroup.rotation.z +=.75;


	scene.add( cubeGroup );
	render();
	console.log('regenerated cube');
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	generateCube();
	render();

}

function animate() {

	requestAnimationFrame( animate );
	controls.update();

}

function render() {
	var time = (new Date()).getTime();
	var timeDiff = time - lastTime;
	var angleChange = angularSpeed * timeDiff * 2 * Math.PI / 1000;
	//camera.rotation.z += angleChange;
	lastTime = time;
      renderer.render( scene, camera );
}
