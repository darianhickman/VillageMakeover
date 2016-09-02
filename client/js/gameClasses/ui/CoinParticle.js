var CoinParticle = IgeParticle.extend({
	classId: 'CoinParticle',
	
	init: function (emitter) {
		IgeParticle.prototype.init.call(this, emitter);
		
		this.texture(ige.client.textures.coin)
			.dimensionsFromTexture();
	}
});