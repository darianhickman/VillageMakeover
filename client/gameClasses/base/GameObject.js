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
		this._tileAdjustX = ((this._bounds3d.x / ige.client.currentTileMap._tileWidth) / 2) - 0.5;
		this._tileAdjustY = ((this._bounds3d.y / ige.client.currentTileMap._tileHeight) / 2) - 0.5;
	},
	
	place: function () {
		
	},

    /**
     * Moves the tile placement of the item from it's current
     * tile location to the new tile location specified. Also
     * translates the entity.
     * @param tileX
     * @param tileY
     * @return {*}
     */
    moveTo: function (tileX, tileY) {
        // Un-occupy the current tiles
        this.unOccupyTile(
            this.data('tileX'),
            this.data('tileY'),
            this.data('tileWidth'),
            this.data('tileHeight')
        );

        // Set the new tile position
        this.data('tileX', tileX)
            .data('tileY', tileY);

        this.occupyTile(
            this.data('tileX'),
            this.data('tileY'),
            this.data('tileWidth'),
            this.data('tileHeight')
        );

        var tx = tileX + this._tileAdjustX;
        var ty = tileY + this._tileAdjustY;

        this.translateToTile(tx,ty);

        ige.client.eventEmitter.emit('updatePosition',{"id":this.classId(), "type":this.type})
console.log("this", this)
        return this;
    },
});