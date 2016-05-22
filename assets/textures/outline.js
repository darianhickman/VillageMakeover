// the innovation's outline displayed on the ground while building it
var image = {
    render: function (ctx, entity) {
        // configuration
        var offsetY = 0;
        var strokeWidth = parseInt(GameConfig.config['outlineStrokeWidth'])
        var feasibleColor = GameConfig.config['outlineFeasibleColor'];
        var unfeasibleColor = GameConfig.config['outlineUnfeasibleColor'];
        var unitLength = ige.$('tileMap1')._tileWidth / 2;

        var dx = entity.tileWidth * unitLength;
        var dy = entity.tileHeight * unitLength;

        ctx.fillStyle = "transparent";
        if (entity.isFeasible) {
            ctx.strokeStyle = feasibleColor;
        }
        else {
            ctx.strokeStyle = unfeasibleColor;
        }
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        var x1 = 0, y1 = -unitLength + offsetY;
        var x2 = x1 + dx * 2, y2 = y1 + dx;
        var x3 = x2 - dy * 2, y3 = y2 + dy;
        var x4 = x3 - dx * 2, y4 = y3 - dx;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
};
