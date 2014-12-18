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
//var world = new World(10, 10, 10, 30, 35, 35, 1, 3500, 5000);
var world;

// Curtain (shows faults in algorithm that should be corrected)
//var world = new World(10, 1, 60, 50, 20, 30, 1, 3500, 5000);

// What I demo'd for you 
//var world = new World(20, 20, 20, 50, 20, 30, 1, 3500, 5000);

// gui
var gui;
var params = {
	width: 10,
	height: 10,
	depth: 10, 
	ratio_1: 35,
	ratio_2: 35,
	ratio_3: 30,
	density_1: 1,
	density_2: 3500,
	density_3: 4000
};

function create_world() {
	console.log('updating with params');
	console.log(params);
	world = new World(params.width, params.height, params.depth, params.ratio_1, params.ratio_2, params.ratio_3, params.density_1, params.density_2, params.density_3, update_world);
};

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 3000 );
	camera.position.z = 300;

	controls = new THREE.OrbitControls(camera, document.getElementById( 'container' ));
	controls.addEventListener('change', render);

	
	scene = new THREE.Scene();
	//scene.fog = new THREE.FogExp2( 0xcccccc, 0.002);

	renderer = new THREE.WebGLRenderer( { antialias: false });
	//renderer.setClearColor ( scene.fog.color, 1);
	//renderer.setSize( window.innerWidth, window.innerHeight );
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

	//setup gui
/*
        width: 10,
        height: 10,
        depth: 10,
        ratio_1: 35,
        ratio_2: 35,
        ratio_3: 30,
        density_1: 1,
        density_2: 3500,
        density_3: 4000
*/
	gui = new dat.GUI({
		load: {
			  "preset": "10x10x10",
			  "closed": false,
			  "remembered": {
			    "10x10x10": {
			      "0": {
				"width": 10,
				"height": 10,
				"depth": 10,
				"ratio_1": 35,
				"ratio_2": 35,
				"ratio_3": 30,
				"density_1": 1,
				"density_2": 3500,
				"density_3": 5000
			      }
			    },
			    "Curtain": {
			      "0": {
				"width": 10,
				"height": 10,
				"depth": 1,
				"ratio_1": 35,
				"ratio_2": 35,
				"ratio_3": 30,
				"density_1": 1,
				"density_2": 3500,
				"density_3": 5000
			      }
			    },
			  },
			},
		preset: '10x10x10'
	});	
	var f1 = gui.addFolder('Dimensions');
	f1.add(params, 'width').name('Width').min(1).max(50).step(1).onFinishChange(create_world);
	f1.add(params, 'height').name('Height').min(1).max(50).step(1).onFinishChange(create_world);
	f1.add(params, 'depth').name('Depth').min(1).max(50).step(1).onFinishChange(create_world);
	f1.open();

	var f2 = gui.addFolder('Material 1');
	gui.add(params, 'ratio_1').name('Ratio 1').min(0).max(100).step(1).onFinishChange(create_world);
	gui.add(params, 'density_1').name('Density 1').min(0).max(5000).step(100).onFinishChange(create_world);
	f2.open();

	var f3 = gui.addFolder('Material 2');
	gui.add(params, 'ratio_2').name('Ratio 2').min(0).max(100).step(1).onFinishChange(create_world);
	gui.add(params, 'density_2').name('Density 2').min(0).max(5000).step(100).onFinishChange(create_world);
	f3.open();

	var f4 = gui.addFolder('Material 3');
	gui.add(params, 'ratio_3').name('Ratio 3').min(0).max(100).step(1).onFinishChange(create_world);
	gui.add(params, 'density_3').name('Density 3').min(0).max(5000).step(100).onFinishChange(create_world);
	f4.open();

	create_world();

        console.log('init complete');
}


function update_world (data) {
    console.log("Got updated world");
    world = JSON.parse(data);
    generateCube();
}

function generateCube() {

	scene.remove(cubeGroup);

	// cube geometry (200 x 200 x 200);
	cubeGroup = new THREE.Object3D;
	var geometry = new THREE.BoxGeometry(10, 10, 10);
	var material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
	var material_water = new THREE.MeshBasicMaterial( { color: 0x0033FF, transparent: false, opacity: 0.2, wireframe: true } );
	var material_air = new THREE.MeshBasicMaterial( { color: 0x33CCFF, transparent: false, opacity: 0.5, wireframe: true } );
	//var material_air = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, transparent: true, opacity: 0.5 } );
	var material_bedrock = new THREE.MeshBasicMaterial( { color: 0x505050, wireframe: false } );

	var i,j,k,rand;
	var cubeMesh;
	var material;

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
	//cubeGroup.position.set(-i*scale/2,-j*scale/2,-k*scale/2);
	cubeGroup.position.set(-i*scale/2,j*scale/2,-k*scale/2);
	//cubeGroup.position.set(0,0,0);
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
