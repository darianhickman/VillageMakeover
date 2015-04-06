var HiEntity = IgeEntity.extend({
    classId: 'HiEntity',
    tick: function (ctx) {
        IgeEntity.prototype.tick.call(this, ctx);
        for(var x_=-100; x_ < 300; x_ ++) {
            for(var y_=-100; y_ < 300; y_ ++) {
                var x = x_ * 20;
                var y = y_ * 20;
                var tx = Math.ceil(x / ige.$('tileMap1')._tileWidth);
                var ty = Math.ceil(y / ige.$('tileMap1')._tileHeight);
                if(!ige.$('tileMap1').inGrid(tx, ty, 1, 1)) continue;

                var isFree = !ige.$('tileMap1').isTileOccupied(
                    tx,
                    ty,
                    1,
                    1);

                if(isFree)
                    ctx.fillStyle = '#3f3';
                else
                    ctx.fillStyle = 'red';

                var point = new IgePoint3d(x, y, 0);
                var p = point.toIso();
                ctx.fillRect(p.x, p.y, 3, 3);
            }
        }
    }
});