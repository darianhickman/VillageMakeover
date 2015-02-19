var LimitZoomPanComponent = IgeEventingClass.extend({
	classId: 'LimitZoomPanComponent',
	componentId: 'limitZoomPan',

	init: function (entity, options) {
		this._entity = entity;
		var self = this;
		
		if (!entity.mousePan) {
			this.log("Entity does not have mouse pan component...", 'error');
		}
		if (!entity.camera) {
			this.log("Entity does not have a camera (it's not a viewport?)", 'error');
		}
		if (options.boundsX !== undefined && options.boundsY !== undefined && options.boundsWidth !== undefined && options.boundsHeight !== undefined) {
			this._options = options;
		} else {
			this.log("Missing limit bounds parameters!", 'error');
		}
		
		this._currentViewportScaleX = 1.0;
		this._currentViewportScaleY = 1.0;
		
		this._oldScaleTo = entity.camera.scaleTo;
		entity.camera.scaleTo = function(x, y, z) {
			self._currentViewportScaleX = x;
			self._currentViewportScaleY = y;			
			self._limitZoomToWindow.call(self, self._entity);
			self._resizeEvent.call(self);
		};
			
		this._oldResizeEvent = entity._resizeEvent;
		entity._resizeEvent = function(event) {
			self._oldResizeEvent.call(self._entity, event);
			self._resizeEvent.call(self);
		}
		this._resizeEvent();
	},
	
	_limitZoomToWindow: function(viewport) {
		var finalX = this._currentViewportScaleX;
		var finalY = this._currentViewportScaleY;
		var viewportWidth = viewport._bounds2d.x / finalX;
		var viewportHeight = viewport._bounds2d.y / finalY;
		
		if (this._entity._bounds2d.x >= this._entity._bounds2d.y && viewportWidth >= this._options.boundsWidth) {
			finalX = this._entity._bounds2d.x / this._options.boundsWidth;
			finalY = finalX;
		}
		if (this._entity._bounds2d.y > this._entity._bounds2d.x && viewportHeight >= this._options.boundsHeight) {
			finalY = this._entity._bounds2d.y / this._options.boundsHeight;
			finalX = finalY;
		}
		
		this._oldScaleTo.call(this._entity.camera, finalX, finalY, 0);
		this._currentViewportScaleX = finalX;
		this._currentViewportScaleY = finalY;
	},
	
	_limitPanToWindow: function(viewport) {
		var panFinalX = viewport.camera._translate.x;
		var panFinalY = viewport.camera._translate.y;	
		
		if (panFinalX < viewport.mousePan._limit.x) {
			panFinalX = viewport.mousePan._limit.x;
		}
		if (panFinalX > viewport.mousePan._limit.x + viewport.mousePan._limit.width) {
			panFinalX = viewport.mousePan._limit.x + viewport.mousePan._limit.width;
		}
		if (panFinalY < viewport.mousePan._limit.y) {
			panFinalY = viewport.mousePan._limit.y;
		}
		if (panFinalY > viewport.mousePan._limit.y + viewport.mousePan._limit.height) {
			panFinalY = viewport.mousePan._limit.y + viewport.mousePan._limit.height;
		}
		
		viewport.camera.translateTo(
			panFinalX,
			panFinalY,
			0
		);
	},
	
	_resizeEvent: function() {
		var viewport = this._entity;
		var viewportWidth = viewport._bounds2d.x / this._currentViewportScaleX;
		var viewportHeight = viewport._bounds2d.y / this._currentViewportScaleY;
		
		viewport.mousePan.limit(new IgeRect(
				-(this._options.boundsWidth - viewportWidth) / 2 + this._options.boundsX,
				-(this._options.boundsHeight - viewportHeight) / 2 + this._options.boundsY,
				this._options.boundsWidth - viewportWidth,
				this._options.boundsHeight - viewportHeight
			)
		);
		this._limitZoomToWindow(viewport);
		this._limitPanToWindow(viewport);
	},
});