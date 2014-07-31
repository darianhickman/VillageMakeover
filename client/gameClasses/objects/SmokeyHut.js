var SmokeyHut = GameObject.extend({
	classId: 'SmokeyHut',
	
	init: function () {
		GameObject.prototype.init.call(this);
		
		this.texture(ige.client.textures.smokeyHut)
			.dimensionsFromCell()
			.bounds3d(76, 76, 50)
			.anchor(-12, -4);
		
		this.calcTileAdjust();
	}
});