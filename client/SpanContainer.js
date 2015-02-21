var MyInlineContainer = IgeUiElement.extend({
    tick: function(ctx) {
        var i,
            children = this.children(),
            currentX = 0;
        for(i = 0; i < children.length; i++) {
            var child = children[i];
            child.left(currentX);
            currentX += child.width();
        }
    }
});