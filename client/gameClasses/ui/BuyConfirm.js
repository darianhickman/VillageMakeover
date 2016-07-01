var BuyConfirm = Dialog.extend({
	classId: 'BuyConfirm',
    init: function (message, callback) {
        Dialog.prototype.init.call(this);

        var self = this;

        $("#buyConfirmMessage").html(message);
        $("#buyConfirmYes")
            .click(function() {
                mixpanel.track("Confirm buy");
                $("#buyConfirmYes").unbind("click");
                $( "#buyConfirmDialog" ).dialog( "close" );
                self.closeMe();
                callback();
            });

        $("#buyConfirmNo")
            .click(function() {
                mixpanel.track("Cancel buy");
                $("#buyConfirmYes").unbind("click");
                $( "#buyConfirmDialog" ).dialog( "close" );
                self.closeMe();
            });

        $( "#buyConfirmDialog" ).dialog({ resizable: false, draggable: false, closeOnEscape: false, width: 'auto', height: 'auto', modal: true, autoOpen: false, close: function( event, ui ) {$("#buyConfirmYes").unbind("click");self.closeMe();} });
        $( "#buyConfirmDialog" ).dialog( "open" );

        this.closeButton.hide();
        this._underlay.hide();
    },
})
