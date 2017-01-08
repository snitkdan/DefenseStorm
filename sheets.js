    // for saving the date a stat was modified
    // returns the local date
    // courtesy of http://stackoverflow.com/a/4929629

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

/**
 * This is API key from the Google Developer Console
 */
var CLIENT_ID = null;

/**
 * This is the spreadsheet's ID from its URL
 */
var SPREADSHEET_ID = null;

/**
 * SCOPES determine an app's permissions when making API calls involving user data
 */
var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/**
 * This is the set of cells that we want returned. E.g. A1:B2 would refer to these cells:
 * | A1 | B1 |
 * | A2 | B2 |
 *
 * TODO: figure out how to return all non-empty rows instead of hardcoding a large number of rows.
 */
var RANGE = 'A2:H1000';

/**
 * For reading a JSON configuration file
 */
function readConfig(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

/**
 * Set CLIENT_ID and SPREADSHEET_ID based on config file
 */
function setIDsFromConfig(text) {
  var data = JSON.parse(text);
  CLIENT_ID = data.client_id;
  SPREADSHEET_ID = data.sheet_id;
}

readConfig("config.json", setIDsFromConfig);

/**
 * Check if current user has authorized this application
 */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = $('#authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.remove();
    $('#logo').css('display', 'hidden');
    loadSheetsApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    var authButton = $('<a>').attr('class', 'waves-effect waves-light btn-large');
    authButton.text('Authorize Google Sheets');
    authButton.attr('id', 'authorize-button');
    authButton.click(handleAuthClick);
    $('#logo').css('display', 'block');
    authorizeDiv.append(authButton);
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
var handleAuthClick = function(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

var test_data = [];
var lastRow = 2;

/**
 * Load Sheets API client library
 */
function loadSheetsApi() {
  var discoveryUrl =
      'https://sheets.googleapis.com/$discovery/rest?version=v4';
  gapi.client.load(discoveryUrl).then(processSheetsData);
}

/**
 * Stuff rows of stats from the spreadsheet into a JSON object
 */
function processSheetsData() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE
  }).then(function(response) {
    var range = response.result;
    var row;
    if (range.values.length > 0) {
      // This part turns the array of arrays returned by the API into a JSON resembling the hardcoded 'test_data' object we had before.
      for (i = 0; i < range.values.length; i++) {
        row = range.values[i];
        // Require columns 0, 2 and 5 which currently correspond to title, org, and stat //
        if (row[0] && row[2] && row[5]) {
          test_data[i] = {
            'title'     : row[0],
            'source'    : row[1],
            'org'       : row[2],
            'published' : row[3],
            'lastTouch' : row[4],
            'stat'      : row[5],
            'topicTags' : row[6],
            'rowNum'    : row[7]
          }
        }
      }
      window.lastRow = range.values.length + 1;
      $('#logo').css('display', 'block');
      $('#root').css('display', 'block');
      renderTable();
    } else {
      console.log('No data found within the specified range.');
    }
  }, function(response) {
    console.log('Error. Sheets API response: ' + response.result.error.message);
  });
}
