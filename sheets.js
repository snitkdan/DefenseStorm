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
var SCOPES = null;

/**
 * This is the set of cells that we want returned. E.g. A1:B2 would refer to these cells:
 * | A1 | B1 |
 * | A2 | B2 |
 *
 * TODO: figure out how to return all non-empty rows instead of hardcoding a large number of rows.
 */
var RANGE = null;

var test_data = [];
var LASTROW = 2;
var quickFilterYears = [];

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
  SCOPES = data.scopes;
  LASTROW = data.first_data_row;
  RANGE = "A" + data.first_data_row + ":H" + data.max_rows;
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
    $('#auth-logo').css('display', 'none');
    loadSheetsApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    var authButton = $('<a>').attr('class', 'waves-effect waves-light btn-large');
    authButton.text('Authorize Google Sheets');
    authButton.attr('id', 'authorize-button');
    authButton.click(handleAuthClick);
    $('#auth-logo').css('display', 'block');
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
  {
    client_id: CLIENT_ID,
    scope: SCOPES, immediate: false
  },
  handleAuthResult
  );
  return false;
}

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
        // Check that the row is not entirely blank 
        if (!(row[0] == '' && row[1] == '' && row[2] == '' && row[3] == '' && row[4] == '' && row[5] == '' && row[6] == '' && row[7] == '')) {
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
          if (row[3] != '') {
            var publishedYear = row[3].split('/')[2];
            if (!window.quickFilterYears.includes(publishedYear)) {
               window.quickFilterYears.push(publishedYear);
            }
          }
        }
      }
      window.LASTROW = range.values.length + 1;
      window.quickFilterYears = window.quickFilterYears.sort();
      $('#logo').css('display', 'block');
      $('#root').css('display', 'block');
      renderTable();
    } else {
      Materialize.toast('No data found within the specified range.', 4000);
    }
  }, function(response) {
    Materialize.toast('Failed to get data.', 4000);
    console.log('Failed to get data. Sheets API response: ' + response.result.error.message);
  });
}