var ScaleToPointComponent = IgeEventingClass.extend({
	classId: 'ScaleToPointComponent',
	componentId: 'scaleToPoint',

	init: function (entity, options) {
		var self = this;
		this._entity = entity;
	},
	
	scaleTo: function (scaleX, scaleY, pointX, pointY) {
		ige.input._updateMouseData({igeX: pointX, igeY: pointY}); // this function expects a mouse event but only really needs these 2 values
		var oldMousePos = this._entity.mousePosWorld();
		this._entity.camera.scaleTo(scaleX, scaleY, 0);
		ige.input._updateMouseData({igeX: pointX, igeY: pointY});
		var newMousePos = this._entity.mousePosWorld();
		this._entity.camera.translateBy(
			oldMousePos.x - newMousePos.x,
			oldMousePos.y - newMousePos.y,
			0
		);
	},
});