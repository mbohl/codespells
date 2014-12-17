var SOLID_THRESHOLD = 4000;
function Voxel(x, y, z, weight) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.weight = weight;
}

// Need to rewrite this - world should be its own object, ane it settles.. need to re-evaluate...
function World(x, y, z, ratio_1, ratio_2, ratio_3, weight_1, weight_2, weight_3 ) {

	this.x = x;
	this.y = y;
	this.z = z;

	this.ratio_1 = ratio_1;
	this.ratio_2 = ratio_2;
	this.ratio_3 = ratio_3;

	this.weight_1 = weight_1;
	this.weight_2 = weight_2;
	this.weight_3 = weight_3;
	this.size = x * y * z;

	var map = [];
	var i = 0;
	var j = 0;
	var k = 0;
	var w = 0;
	var weights = [this.size];
	var set_1 = Math.round(this.size * (ratio_1/100));
	var set_2 = Math.round(this.size * (ratio_2/100));
	var set_3 = Math.round(this.size * (ratio_3/100));


	console.log('Creating map of size [ ', x, ', ', y, ', ', z, ' ], raw ', this.size);
	console.log('Weight/Ratio 1: ', weight_1, '/', ratio_1, ' set size is ', set_1);
	console.log('Weight/Ratio 2: ', weight_2, '/', ratio_2, ' set size is ', set_2);
	console.log('Weight/Ratio 3: ', weight_3, '/', ratio_3, ' set size is ', set_3);

	// Generate weight table
	for (i = 0; i < set_1; i++) {
		weights[i] = weight_1;
	}	

	for (i = set_1; i < set_1 + set_2; i++) {
		weights[i] = weight_2;
	}	

	for (i = set_1 + set_2; i < set_1 + set_2 + set_3; i++) {
		weights[i] = weight_3;
	}	

	//console.log(weights);
	weights = shuffle(weights);
	//console.log(weights);

	// Populate weights based on order defined above
	for (i = 0; i < x; i++) {
		map[i] = [];
		for (j=0; j < y; j++) {
			map[i][j] = [];
			for (k=0; k<z; k++) {
				map[i][j][k] = new Voxel(i,j,k,weights[w]);
				w++;
			}
		}
	}

	this.map = map;

}

World.prototype.settle = function() {

	// Settle 10 times
	var temp, v1, v2, move_i, move_j;
	var map = this.map;
	x = this.x;
	y = this.y;
	z = this.z;

	for (var q = 0; q < 1; q++ ) {
		// Settle the map vertically
		/*
		for (i = 0; i < this.x; i++) {
			for (j = 0; j < this.y; j++) {
				// Standard no-stable sort
				// We may need to swap the sort order
				map[i][j].sort(function(a,b) {
					return a.weight - b.weight;
				});
			}
		}
		*/

		// move_i and move_j are used to make sure we're not moving then undoing the move when the previously moved element is hit later in the loop
		// i.e., avoids stalemate

		// settle by neighbor
		for (i = 0; i < this.x; i++) {
			move_i = 0;
			for (j = 0; j < this.y; j++) {
				move_j = 0;
				for (k = 0; k < this.z; k++) {
					//console.log('At [ ', i, ', ', j, ', ', k, ' ]');
					// Materials GTE SOLID_THRESHOLD only settled down
					// Materials LT SOLID_THRESHOLD can settle down, or spread out if any of its neighbors have a lower density
					
					v1 = map[i][j][k];
					if (v1.weight >= SOLID_THRESHOLD) {
						// Make sure we're not out of bounds
						//console.log('Found Solid, weight ', v1.weight);
						if (k < z - 1) {
							//console.log('Not edge, looking at next in line');
							v1 = map[i][j][k];
							v2 = map[i][j][k+1];
							if (v1.weight > v2.weight) {
								//console.log('Swapping [ ', i, ', ', j, ', ', k, ' ], weight ', v1.weight , ' with:' );
								//console.log('         [ ', i, ', ', j, ', ', k+1, ' ], weight ', v2.weight );
								temp = map[i][j][k].weight;
								map[i][j][k].weight = map[i][j][k+1].weight;
								map[i][j][k+1].weight = temp;		

							}	
						}
					} else {
						// Make sure we're not out of bounds
						//console.log('Found Solid, weight ', v1.weight);
						if (k < z - 1) {
							//console.log('Not edge, looking at next in line');
							v1 = map[i][j][k];
							v2 = map[i][j][k+1];
							if (v1.weight > v2.weight && v2.weight < SOLID_THRESHOLD) {
								//console.log('Swapping [ ', i, ', ', j, ', ', k, ' ], weight ', v1.weight , ' with:' );
								//console.log('         [ ', i, ', ', j, ', ', k+1, ' ], weight ', v2.weight );
								temp = map[i][j][k].weight;
								map[i][j][k].weight = map[i][j][k+1].weight;
								map[i][j][k+1].weight = temp;		
							}
						}


						if ( move_j < 1 && j < y - 1) { // Sort in positive y direction
							//console.log('Not edge, looking at next in line');
							v1 = map[i][j][k];
							v2 = map[i][j+1][k];
							if (v1.weight > v2.weight && v2.weight < SOLID_THRESHOLD) {
								//console.log('Swapping [ ', i, ', ', j, ', ', k, ' ], weight ', v1.weight , ' with:' );
								//console.log('         [ ', i, ', ', j+1, ', ', k, ' ], weight ', v2.weight );
								temp = map[i][j][k].weight;
								map[i][j][k].weight = map[i][j+1][k].weight;
								map[i][j+1][k].weight = temp;		
								move_j++;

							}	
						} 

						if ( move_j < 1 && j > 0) { // Sort in negative y direction
							//console.log('Not edge, looking at next in line');
							v1 = map[i][j][k];
							v2 = map[i][j-1][k];
							if (v1.weight > v2.weight && v2.weight < SOLID_THRESHOLD) {
								//console.log('Swapping [ ', i, ', ', j, ', ', k, ' ], weight ', v1.weight , ' with:' );
								//console.log('         [ ', i, ', ', j-1, ', ', k, ' ], weight ', v2.weight );
								temp = map[i][j][k].weight;
								map[i][j][k].weight = map[i][j-1][k].weight;
								map[i][j-1][k].weight = temp;		
								move_j++;

							}	
						} 
						
						if ( move_i < 1 && i < x - 1) { // Sort in positive x direction
							//console.log('Not edge, looking at next in line');
							v1 = map[i][j][k];
							v2 = map[i+1][j][k];
							if (v1.weight > v2.weight && v2.weight < SOLID_THRESHOLD) {
								//console.log('Swapping [ ', i, ', ', j, ', ', k, ' ], weight ', v1.weight , ' with:' );
								//console.log('         [ ', i+1, ', ', j, ', ', k, ' ], weight ', v2.weight );
								temp = map[i][j][k].weight;
								map[i][j][k].weight = map[i+1][j][k].weight;
								map[i+1][j][k].weight = temp;		
								move_i++;

							}	
						}
						
						if ( move_i < 1 && i > 0) { // Sort in negative x direction
							//console.log('Not edge, looking at next in line');
							v1 = map[i][j][k];
							v2 = map[i-1][j][k];
							if (v1.weight > v2.weight && v2.weight < SOLID_THRESHOLD) {
								//console.log('Swapping [ ', i, ', ', j, ', ', k, ' ], weight ', v1.weight , ' with:' );
								//console.log('         [ ', i-1, ', ', j, ', ', k, ' ], weight ', v2.weight );
								temp = map[i][j][k].weight;
								map[i][j][k].weight = map[i-1][j][k].weight;
								map[i-1][j][k].weight = temp;		
								move_i++;

							}	
						}
					}
						
				} // end k loop
			} // end j loop
		} // End i loop
	} // End resolution Loop


	this.map = map;

}

// Fisher-Yates (aka Knuth) Shuffle
// https://github.com/coolaj86/knuth-shuffle
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//var world = new World(10, 10, 10, 10, 20, 70, 1, 3500, 5000);

//console.log(world.map);
