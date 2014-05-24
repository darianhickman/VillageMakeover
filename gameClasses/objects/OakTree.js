var OakTree = GameObject.extend({
	classId: 'OakTree',
	
	init: function () {
		GameObject.prototype.init.call(this);
		
		this.texture(ige.client.textures.oakTree)
			.dimensionsFromCell()
			.bounds3d(38, 38, 80)
			.width(100, true)
			.anchor(0, -4);
		
		this.calcTileAdjust();
	}
});