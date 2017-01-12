// For saving the date a stat was modified
// Returns the local date
// Courtesy of http://stackoverflow.com/a/4929629
var currDate = function() {
    return window.getMMDDYYYYFromDateParts(window.getDateParts(new Date()));
}

var getDateParts = function(dateObj) {
    var dd = dateObj.getDate();
    var mm = dateObj.getMonth() + 1; //January is 0!
    var yyyy = dateObj.getFullYear();
    dd = window.addDigitIfLessThanTen(dd);
    mm = window.addDigitIfLessThanTen(mm);
    return [yyyy, mm, dd];
}

var addDigitIfLessThanTen = function(smallInt) {
    if (smallInt < 10) {
        return '0' + smallInt;
    }
    return smallInt;
}

var getMMDDYYYYFromDateParts = function(dateParts) {
    return dateParts[1] + '/' + dateParts[2] + '/' + dateParts[0];
}

var getYYYYMMDDFromDateParts = function(dateParts) {
    return dateParts[0] + '-' + dateParts[1] + '-' + dateParts[2];
}