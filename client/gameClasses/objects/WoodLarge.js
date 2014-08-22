var WoodLarge = GameObject.extend({
	classId: 'WoodLarge',
	
	init: function () {
		GameObject.prototype.init.call(this);
		
		this.texture(ige.client.textures.woodLarge)
			.dimensionsFromCell()
			.bounds3d(38, 38, 30)
			.anchor(-5, 8);
		
		this.calcTileAdjust();
	}
});