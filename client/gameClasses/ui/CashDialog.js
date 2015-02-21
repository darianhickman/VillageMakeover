/**
 * Created by darianhickman on 2/21/15.
 */
var CashDialog = Dialog.extend({
	classId: 'CashDialog',

    init: function () {
        Dialog.prototype.init.call(this);

        var self = this

        // background texture
        var panel = new IgeUiElement()
            .id('coinDialogImage')
            .layer(0)
            .texture(ige.client.textures.moneyMenuBackground)
            .dimensionsFromTexture()
            .mount(this);

        //add 5 transparent buttons over the exact pixels needed
    },

    var b1 = IgeUiElement()
        .id('b1')
        .left(10)
        .width(50)
        .height(100)
        .mount(panel),

    var b2 = IgeUiElement()
            .id('b2')
        .left(110)
        .width(50)
        .height(100)
        .mount(panel),
    var b3 = IgeUiElement()
            .id('b3')
        .left(220)
        .width(50)
        .height(100)
        .mount(panel),

    var b4 = IgeUiElement()
            .id('b4')
        .left(330)
        .width(50)
        .height(100)
        .mount(panel),

    var b5 = IgeUiElement()
            .id('b5')
        .left(440)
        .width(50)
        .height(100)
        .mount(panel)

})

//since it's actually all one image it will be pretty tricky.
// use gimp to get needed offsets and widths.

