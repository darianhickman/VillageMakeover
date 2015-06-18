var image = {
    render: function (ctx, entity) {
        var originX0 = -entity._bounds2d.x2,
            originY0 = -entity._bounds2d.y2;

        ctx.fillStyle = '#D3D3D3';
        ctx.beginPath();
        ctx.moveTo(originX0,originY0+40);
        ctx.lineTo(originX0+100,originY0+40);
        ctx.lineTo(originX0+100,originY0+20);
        ctx.lineTo(originX0+140,originY0+60);
        ctx.lineTo(originX0+100,originY0+100);
        ctx.lineTo(originX0+100,originY0+80);
        ctx.lineTo(originX0,originY0+80);
        ctx.lineTo(originX0,originY0+40);
        ctx.stroke();
        ctx.fill();

    }
};
