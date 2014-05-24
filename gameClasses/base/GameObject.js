var GameObject = IgeEntity.extend({
	classId: 'GameObject',
	
	init: function () {
		IgeEntity.prototype.init.call(this);
		
		this.isometric(true)
			.bounds3d(40, 40, 40)
			.drawBounds(true);
		
		this._tileAdjustX = 0;
		this._tileAdjustY = 0;
	},
	
	calcTileAdjust: function () {
		this._tileAdjustX = ((this._bounds3d.x / ige.$('tileMap1')._tileWidth) / 2) - 0.5;
		this._tileAdjustY = ((this._bounds3d.y / ige.$('tileMap1')._tileHeight) / 2) - 0.5;
	},
	
	place: function () {
		
	}
});