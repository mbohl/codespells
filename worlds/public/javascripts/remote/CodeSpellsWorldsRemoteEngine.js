var SOLID_THRESHOLD = 4000;
function Voxel(weight) {
	this.weight = weight;
}

// Need to rewrite this - world should be its own object, ane it settles.. need to re-evaluate...
function World(x, y, z, ratio_1, ratio_2, ratio_3, weight_1, weight_2, weight_3, update_world ) {

    // jQuery REST call
    $.ajax({ url: 'http://node-dev.codespells.mbohl.org/api/worlds/100' }).then(update_world);
    

}

World.prototype.settle = function() {
}
