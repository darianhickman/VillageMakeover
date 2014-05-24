var WoodSmall = GameObject.extend({
	classId: 'WoodSmall',
	
	init: function () {
		GameObject.prototype.init.call(this);
		
		this.texture(ige.client.textures.woodSmall)
			.dimensionsFromCell()
			.bounds3d(38, 38, 30)
			.anchor(-3, 13);
		
		this.calcTileAdjust();
	}
});