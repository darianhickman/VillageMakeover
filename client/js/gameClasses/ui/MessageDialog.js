var MessageDialog = Dialog.extend({
	classId: 'MessageDialog',
    init: function (title, message, callback) {
        Dialog.prototype.init.call(this);

        var self = this;

        self.title = title;
        self.callback = callback;

        $("#messageDialogMessage").html(message);

        $("#messageDialogOK")
            .click(function() {
                $("#messageDialogOK").unbind("click");
                self.closeMe();
            })
            .show();

        this.closeButton.hide();
        this._underlay.hide();
    },

    show: function () {
        var self = this;

        $( "#messageDialog" ).dialog({ title: self.title, resizable: false, draggable: true, closeOnEscape: false, width: 'auto', height: 'auto', modal: true, autoOpen: false, close: function( event, ui ) {
            $("#messageDialogOK").unbind("click");
            self.closeMe();
        }});
        $( "#messageDialog" ).dialog( "open" );
        Dialog.prototype.show.call(self);

        return this;
    },

    hide: function () {
        var self = this;

        $( "#messageDialog" ).dialog({close: function( event, ui ) {}});
        $( "#messageDialog" ).dialog( "close" );
        Dialog.prototype.hide.call(self);

        return this;
    }
})
