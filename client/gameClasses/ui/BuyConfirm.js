var BuyConfirm = Dialog.extend({
	classId: 'BuyConfirm',
    init: function (message, callback, confirmOnly) {
        Dialog.prototype.init.call(this);

        var self = this;

        $("#buyConfirmMessage").html(message);
        if(confirmOnly !== null && confirmOnly !== undefined && confirmOnly === true){
            $("#buyConfirmYes").hide();
            $("#buyConfirmNo").hide();
            $("#buyConfirmOK")
                .click(function() {
                    mixpanel.track("Confirm dialog");
                    $("#buyConfirmOK").unbind("click");
                    $( "#buyConfirmDialog" ).dialog( "close" );
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
                    $( "#buyConfirmDialog" ).dialog( "close" );
                    self.closeMe();
                    callback();
                })
                .show();

            $("#buyConfirmNo")
                .click(function() {
                    mixpanel.track("Cancel buy");
                    $("#buyConfirmYes").unbind("click");
                    $( "#buyConfirmDialog" ).dialog( "close" );
                    self.closeMe();
                })
                .show();
        }

        $( "#buyConfirmDialog" ).dialog({ resizable: false, draggable: true, closeOnEscape: false, width: 'auto', height: 'auto', modal: true, autoOpen: false, close: function( event, ui ) {$("#buyConfirmYes").unbind("click");$("#buyConfirmOK").unbind("click");self.closeMe();} });
        $( "#buyConfirmDialog" ).dialog( "open" );

        this.closeButton.hide();
        this._underlay.hide();
    },
})
