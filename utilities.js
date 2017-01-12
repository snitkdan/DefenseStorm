// << The following functions are based on http://stackoverflow.com/a/4929629
// Returns the local date, for recording the date a stat was modified/added
var currDate = function() {
    return window.getMMDDYYYYFromDateParts(window.getDateParts(new Date()));
}

// Returns an array containing the year, month, and day of a Date
var getDateParts = function(dateObj) {
    var dd = dateObj.getDate();
    var mm = dateObj.getMonth() + 1; //January is 0!
    var yyyy = dateObj.getFullYear();
    return [yyyy, mm, dd];
}

// Add a preceding 0 to months and days less than 10
var addDigitIfLessThanTen = function(smallInt) {
    if (smallInt < 10) {
        return '0' + smallInt;
    }
    return smallInt;
}

// Return a string of the format MM/DD/YYYY from an array containing the elements of a date
var getMMDDYYYYFromDateParts = function(dateParts) {
    return dateParts[1] + '/' + dateParts[2] + '/' + dateParts[0];
}

// Return a string of the format YYYY-MM-DD from a string in the format M/D/YYYY
var getYYYYMMDDFromDateString = function(dateString) {
    var dateParts = dateString.split('/');
    return dateParts[2] + '-' + addDigitIfLessThanTen(dateParts[0]) + '-' + addDigitIfLessThanTen(dateParts[1]);
}


// end >>

// Return a new array, minus duplicates and empty strings
// Adapted from http://stackoverflow.com/a/12551709
var removeDuplicateTags = function(topicTags) {
    var tagArray = topicTags.trim().split(',');
    var result = [];
    $.each(tagArray, function(i, e) {
        if ($.inArray(e, result) == -1 && e != '') result.push(e);
    });
    return result.join(',');
}