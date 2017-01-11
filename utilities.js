// This file is for misc. useful functions 

// Returns whether or not an URL string begins with 'ftp://', 'http://', or 'https://',

// Courtesy of http://stackoverflow.com/a/24657561
function hasProtocol(url) {
    return /^(?:f|ht)tps?\:\/\//.test(url);
}

// For saving the date a stat was modified
// Returns the local date
// Courtesy of http://stackoverflow.com/a/4929629
var currDate = function() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = mm + '/' + dd + '/' + yyyy;
    return today;
}