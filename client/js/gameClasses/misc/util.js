function getParameterByName(thing, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(thing);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getCookie(c_name) {
    var c_value = " " + document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_value = null;
    }
    else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start,c_end));
    }
    return c_value;
}

function convertTimeFormatToMilliseconds(timeFormat){
    var milliseconds = 0,
        days = 0,
        hours = 0,
        minutes = 0,
        seconds = 0,
        millisecondList = [];

    //timeFormat -> 1d2h3m4s 1d2h 2h 3m 3m20s

    millisecondList['day'] = 864e5
    millisecondList['hour'] = 36e5
    millisecondList['minute'] = 6e4
    millisecondList['second'] = 1000

    if(timeFormat.indexOf('d') !== -1){
        days = timeFormat.match(/\d+(?=d)/)
        milliseconds += days * millisecondList['day']
    }
    if(timeFormat.indexOf('h') !== -1){
        hours = timeFormat.match(/\d+(?=h)/)
        milliseconds += hours * millisecondList['hour']
    }
    if(timeFormat.indexOf('m') !== -1){
        minutes = timeFormat.match(/\d+(?=m)/)
        milliseconds += minutes * millisecondList['minute']
    }
    if(timeFormat.indexOf('s') !== -1){
        seconds = timeFormat.match(/\d+(?=s)/)
        milliseconds += seconds * millisecondList['second']
    }

    return milliseconds
}