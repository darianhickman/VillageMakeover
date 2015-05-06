var image = {
    render: function (ctx, entity) {
        var originX0 = -entity._bounds2d.x2,
            originY0 = -entity._bounds2d.y2,
            width = entity._bounds2d.x,
            height = entity._bounds2d.y;

        ctx.globalAlpha=0.9;
        ctx.fillStyle = '#83452c';
        ctx.fillRect(originX0, originY0, width, height);

    }
};
