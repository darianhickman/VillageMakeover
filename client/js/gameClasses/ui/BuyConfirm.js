var BuyConfirm = Dialog.extend({
	classId: 'BuyConfirm',
    init: function (message, callback, confirmOnly) {
        Dialog.prototype.init.call(this);

        var self = this;

        ige.client.newBuyConfirm = self;

        $("#buyConfirmMessage").html(message);
        if(confirmOnly !== null && confirmOnly !== undefined && confirmOnly === true){
            $("#buyConfirmYes").hide();
            $("#buyConfirmNo").hide();
            $("#buyConfirmOK")
                .click(function() {
                    mixpanel.track("Confirm dialog");
                    $("#buyConfirmOK").unbind("click");
                    self.closeMe();
                    if(callback !== null && callback !== undefined)
                        callback();
                })
                .show();
        }else{
            $("#buyConfirmOK").hide();

            $("#buyConfirmYes")
                .click(function() {
                    mixpanel.track("Confirm buy");
                    $("#buyConfirmYes").unbind("click");
                    $("#buyConfirmNo").unbind("click");
                    self.closeMe();
                    callback();
                })
                .show();

            $("#buyConfirmNo")
                .click(function() {
                    mixpanel.track("Cancel buy");
                    $("#buyConfirmYes").unbind("click");
                    $("#buyConfirmNo").unbind("click");
                    self.closeMe();
                })
                .show();
        }

        this.closeButton.hide();
        this._underlay.hide();
    },

    show: function () {
        var self = this;

        ige.client.fsm.enterState('buyConfirmDialog', null, function (err) {
            if (!err) {
                $( "#buyConfirmDialog" ).dialog({ resizable: false, draggable: true, closeOnEscape: false, width: 'auto', height: 'auto', modal: true, autoOpen: false, close: function( event, ui ) {$("#buyConfirmYes").unbind("click");$("#buyConfirmNo").unbind("click");$("#buyConfirmOK").unbind("click");self.closeMe();} });
                $( "#buyConfirmDialog" ).dialog( "open" );
                Dialog.prototype.show.call(self);
            }
        });

        return this;
    },

    hide: function () {
        var self = this;

        $( "#buyConfirmDialog" ).dialog({close: function( event, ui ) {}});
        $( "#buyConfirmDialog" ).dialog( "close" );
        Dialog.prototype.hide.call(self);

        return this;
    }
})
