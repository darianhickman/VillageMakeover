/**
 * Created by darianhickman on 2/21/15.
 */
var CashDialog = Dialog.extend({
	classId: 'CashDialog',

    // pull data from correct spreadsheet.
      pull doc id from Settings spread
   // content	currency_catalog	1dnCs_UvLhcLxnr6dqheBfV7xSzE1qG33xvoNsyOqOsg	Contains pricing in usd
    // create labels and make them buttons.
    // loop 5 times instead of hardcoding 5 times.
/*
bundleid	VilageCash	USD	catalog_image	active
1	50	5		yes
2	100	10		yes
3	200	20		yes
4	250	25		yes
*/
w
    init: function () {
        Dialog.prototype.init.call(this);

        var self = this

         var panel = new IgeUiElement()
            .id('coinDialogImage')
            .layer(0)
            .texture(ige.client.textures.moneyMenuBackground)
            .dimensionsFromTexture()
            .mount(this);
       //add 5 transparent buttons over the exact pixels needed
         var b1 =  new IgeUiElement()
            .id('b1')
            .left(10)
            .width(50)
            .height(100)
             .drawBounds(true)
            .mount(panel);

        var b2 = new IgeUiElement()
                .id('b2')
            .left(110)
            .width(50)
            .height(100)
            .mount(panel);

        var b3 = new IgeUiElement()
            .id('b3')
            .left(220)
            .width(50)
            .height(100)
            .mount(panel);

        var b4 = new IgeUiElement()
            .id('b4')
            .left(330)
            .width(50)
            .height(100)
            .mount(panel);

        var b5 = new IgeUiElement()
            .id('b5')
            .left(440)
            .width(50)
            .height(100)
            .mount(panel);

         b1.mouseUp(function() {
                ige.input.stopPropagation();
                ige.client.audio.normClick.play();
                self.hide()

                Buy.buy({cash: cash, coins: coins})
            })
            // background texture



    }



})

//since it's actually all one image it will be pretty tricky.
// use gimp to get needed offsets and widths.

