var Villager = IgeEntity.extend({
	classId: 'Villager',
	
	init: function () {
		var self = this;
		IgeEntity.prototype.init.call(this);
		
		self.isometric(true)
			.bounds3d(20, 20, 30)
			.texture(ige.client.textures.villager1)
			.dimensionsFromCell()
			.addComponent(IgeAnimationComponent)
			.animation.define('NW', [1, 2, 3, 2], 12, -1)
			.animation.define('SW', [4, 5, 6, 5], 12, -1)
			.cell(1)
			.translateTo(0, -10, 0);
		
		// Create a path finder
		self.pathFinder = new IgePathFinder()
			.neighbourLimit(100);

		// Configure the path component for the player entity
		self.addComponent(IgePathComponent).path
			.finder(self.pathFinder)
			.tileMap(ige.$('tileMap1'))
			.tileChecker(function (tileData, tileX, tileY, node, prevNodeX, prevNodeY, dynamic) {
				// Check that the tile is inside the map range
				return !tileData && (tileX >= 0 && tileY >= 0 && tileX <= ige.$('tileMap1').gridSize().x && tileY <= ige.$('tileMap1').gridSize().y);
			})
			.lookAheadSteps(3)
			.dynamic(true)
			.allowSquare(true) // Allow north, south, east and west movement
			.allowDiagonal(true) // Allow north-east, north-west, south-east, south-west movement
			.drawPath(false) // Enable debug drawing the paths
			.drawPathGlow(true) // Enable path glowing (eye candy)
			.drawPathText(true); // Enable path text output
		
		self.path.speed(3);

        self.path.on('pathComplete',function(){
            self.path.clear();
        });
	},
	
	walkToTile: function (x, y) {
		// Map a path to the tile and then walk there
        // Workaround for teleporting glitch
        var path = this.path;
        if(path._points.length > 1){
            path.replacePoints(path._currentPointTo, path._points.length, path._points[path._currentPointTo]);
            path.add(x, y, 0, true);
        }else{
            path.clear()
                .add(x, y, 0, true)
                .start();
        }
	},
	
	currentTile: function () {
		return this._parent.pointToTile(this._translate);
	},
	
	update: function (ctx, tickDelta) {
		IgeEntity.prototype.update.call(this, ctx, tickDelta);
		
		// Set animation based on path direction
		var direction = this.path.getDirection(),
			finalDirection = direction;
		
		if (direction !== this._direction) {
			if (direction) {
				switch (direction) {
					case 'NE':
						direction = 'NW';
						this.scaleTo(-1, 1, 1);
						break;
					
					case 'SE':
						direction = 'SW';
						this.scaleTo(-1, 1, 1);
						break;

                    case 'N':
                        direction = 'NW';
                        this.scaleTo(-1, 1, 1);
                        break;

                    case 'W':
                        direction = 'NW';
                        this.scaleTo(1, 1, 1);
                        break;

                    case 'S':
                        direction = 'SW';
                        this.scaleTo(1, 1, 1);
                        break;

                    case 'E':
                        direction = 'NW';
                        this.scaleTo(-1, 1, 1);
                        break;

					default:
						this.scaleTo(1, 1, 1);
						break;
				}
				
				this.animation.start(direction);
				console.log(direction);
			} else {
				this.animation.stop();
				
				// Select resting cell based on last direction
				switch (this._direction) {
					case 'NE':
						this.cell(2);
						this.scaleTo(-1, 1, 1);
						break;
					
					case 'SE':
						this.cell(5);
						this.scaleTo(-1, 1, 1);
						break;
					
					case 'NW':
						this.cell(2);
						this.scaleTo(1, 1, 1);
						break;
					
					case 'SW':
						this.cell(5);
						this.scaleTo(1, 1, 1);
						break;
				}
			}
			
			this._direction = finalDirection;
		}
	}
});