var PinchZoomComponent = IgeEventingClass.extend({
	classId: 'PinchZoomComponent',
	componentId: 'pinchZoom',

	init: function (entity, options) {
		var self = this;
		this._entity = entity;
		this._enabled = false;

		this._options = {
			threshold: 20,
			zoomSize: 500,
			minScale: 0.25,
			maxScale: 1.0
		};
		for (i in options) {
			this._options[i] = options[i];
		}

		this._entity.on('mouseDown', function (evt) { self._mouseDown(evt); });
		this._entity.on('mouseMove', function (evt) { self._mouseMove(evt); });
		this._entity.on('mouseUp', function (evt) { self._mouseUp(evt); });
	},

	enabled: function (toggle) {
		if (toggle === undefined)
			return this._enabled;

		var self = this;
		this._enabled = toggle;

		return this._entity;
	},

	_mouseDown: function (evt) {
		if (evt instanceof TouchEvent) {
			this._decideToZoom(evt);
		}
	},

	_mouseMove: function (evt) {
		if (evt instanceof TouchEvent && evt.touches.length == 2) {
			newDistance = this._distanceBetweenTouches(evt.touches[0], evt.touches[1]);
			deltaDistance = newDistance - this._initialDistance;

			if (Math.abs(deltaDistance) >= this._options.threshold) {
				newScale = this._initialScale + (deltaDistance / this._options.zoomSize);
				newScale = Math.min(Math.max(newScale, this._options.minScale), this._options.maxScale); // clamp

				var zoomCenter = this._centerBetweenTouches(evt.touches[0], evt.touches[1]);
				if (this._entity.scaleToPoint) // use this nicer zoom if available
					this._entity.scaleToPoint.scaleTo(newScale, newScale, zoomCenter.x, zoomCenter.y);
				else
					this._entity.camera.scaleTo(newScale, newScale, 0);
				
				if (this._entity.limitZoomPan)
					this._entity.limitZoomPan._limitPanToWindow(this._entity);
			}
		}
	},

	_mouseUp: function (evt) {
		if (evt instanceof TouchEvent) {
			this._decideToZoom(evt);
		}
	},

	_decideToZoom: function(evt) {
		if (evt.touches.length == 2) {
			if (this._entity.mousePan) this._entity.mousePan.enabled(false);
			this._initialDistance = this._distanceBetweenTouches(evt.touches[0], evt.touches[1]);
			this._initialScale = this._entity.camera._scale.x;
		} else {
			if (this._entity.mousePan) this._entity.mousePan.enabled(true);
		}
	},

	_distanceBetweenTouches: function(touch1, touch2) {
		return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
	},

	_centerBetweenTouches: function(touch1, touch2) {
		return {x: (touch2.clientX + touch1.clientX) / 2, y: (touch2.clientY + touch1.clientY) / 2};
	},
});