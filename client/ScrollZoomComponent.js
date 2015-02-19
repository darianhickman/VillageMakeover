var ScrollZoomComponent = IgeEventingClass.extend({
	classId: 'ScrollZoomComponent',
	componentId: 'scrollZoom',
		
	init: function (entity, options) {
		var self = this;
		this._entity = entity;
		this._enabled = false;
		this.scrollScale = 1.0;

		this._options = {
			scaleMin: 0.25,
			scaleMax: 1.0,
			scaleStep: 0.05
		};
		for (i in options) {
			this._options[i] = options[i];
		}
		
		ige.input.on('mouseWheel', function (event) { self._handleMouseWheel(event); });
		document.getElementById("igeFrontBuffer").addEventListener('mousewheel', function(e) {
			e.preventDefault();
			return false;
		}, false);
	},
	
	enabled: function (val) {
		if (val !== undefined) {
			this._enabled = val;
			return this._entity;
		}
		return this._enabled;
	},
	
	_handleMouseWheel: function(event) {
		if (this._enabled) {
			var newScrollScale = Math.round(this._entity.camera._scale.x / this._options.scaleStep) * this._options.scaleStep;
			if (event.wheelDelta > 0) {
				newScrollScale += this._options.scaleStep;
				if (newScrollScale > this._options.scaleMax)
					newScrollScale = this._options.scaleMax;
			} else if (event.wheelDelta < 0) {
				newScrollScale -= this._options.scaleStep;
				if (newScrollScale < this._options.scaleMin)
					newScrollScale = this._options.scaleMin;
			}			
			this.scrollScale = newScrollScale;

			if (this._entity.scaleToPoint) // use this nicer zoom if available
				this._entity.scaleToPoint.scaleTo(newScrollScale, newScrollScale, event.igeX, event.igeY);
			else
				this._entity.camera.scaleTo(newScrollScale, newScrollScale, 0);

			if (this._entity.limitZoomPan)
				this._entity.limitZoomPan._limitPanToWindow(this._entity);
		}
	},
});