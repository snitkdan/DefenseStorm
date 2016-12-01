/* sheets.js populates test_data[] from a live Google Spreadsheet
 * The attributes in that spreadsheet are thus:
 *
 *    'title'     : column A
 *    'source'    : column B
 *    'org'       : column C
 *    'published' : column D
 *    'entryType' : column E
 *    'stat'      : column F
 *    'topicTags' : column G
 *
 * Each array element of test_data[] is a row from the sheet.
 * It looks like this:
 *
 *    var test_data = [
 *       {
 *         'title'      : 'Cost of Cyber Crime 2014',
 *         'source'     : '',
 *         'org'        : 'Ponemon Institute',
 *         'published'  : '10/09/2016'
 *         'entryType'  : '',
 *         'stat'       : 'Average annual losses to companies worldwide now
 *                         exceed $7.7 million, with studied companies losing
 *                         up to $65 million.',
 *         'topicTags'  : ''
 *       },
 *
 *       ...
 *
 *     ]
 */

/* This is a React component for an individual Stat, which is a row in the "StatTable" component.
   The properties that it gets is "data", which is an individual JS object that has properties
  'title', 'stat', 'org', and 'published', all of which get rendered in with <td> tags. */
var Stat = React.createClass({
  render:function(){
    return(
      <tr>
        <td>{this.props.data.title}</td>
        <td>{this.props.data.stat}</td>
        <td>{this.props.data.org}</td>
        <td>{this.props.data.published}</td>
      </tr>
    )
  }
});

var SortButtons = React.createClass({
  render:function(){
    return(
      <div>
        <a id={this.props.id + '-0'} onClick={this.props.clickEvent}>
          <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
              <path d="M0 0h24v24H0z" fill="none"/>
          </svg>
        </a>
        <a id={this.props.id + '-1'} onClick={this.props.clickEvent}>
          <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
              <path d="M0 0h24v24H0z" fill="none"/>
          </svg>
        </a>
      </div>
    )
  }
});

/*This is a React component for the StatTable, which holds the headings
As well as the rest of the individual "Stat" entries.
Within the <tbody>, each entry in the'data' property that is passed to this component
(an array of objects), gets mapped to a "Stat" entry, adding a new row to the table
for each element in the "data" property.

Note: (d,i) => is equivalent to .map(function(d,i){}). [In case you haven't gotten around to using ES6]

Styling courtesy of materialize.css*/
var StatTable = React.createClass({
  getInitialState:function(){
    return ({sortCriteria:'published', order:1});
  },
  setSort:function(event){
    var results = event.currentTarget.id.split('-');
    var sortCriteria = results[0];
    var order = results[1];
    this.setState({sortCriteria:sortCriteria, order:order});

  },
  sortRows:function(order){
    var sortCriteria = this.state.sortCriteria;
    var order = this.state.order;
    console.log(sortCriteria);
    var sorted_Rows = this.props.data.sort(function(a,b){
      a = a[sortCriteria].trim().toLowerCase();
      b = b[sortCriteria].trim().toLowerCase();
      if(sortCriteria == 'published'){
        a = new Date(a);
        b = new Date(b);
      }
      if(order == 0){
        if(a < b){
          return -1
        }
        else{
          if(a > b){
            return 1;
          }
        return 0;
        }
      }
      else{
        if(a < b){
          return 1
        }
        else{
          if(a > b){
            return -1;
          }
        return 0;
        }
      }
    });
    return sorted_Rows;
  },
  render:function(){
    if(this.props.data){
      this.sortRows();
    }
    return(
      <div>
        <table className='pure-table pure-table-bordered pure-table-striped'>
          <thead>
            <tr>
                <th className='center-align' data-field="title">Title<SortButtons id='title' clickEvent={this.setSort}/></th>
                <th className='center-align' data-field="stat">Stat<SortButtons id='stat' clickEvent={this.setSort}/></th>
                <th className='center-align' data-field="org">Organization<SortButtons id='org' clickEvent={this.setSort}/></th>
                <th className='center-align' data-field="published">Date Published<SortButtons id='published' clickEvent={this.setSort}/></th>
            </tr>
          </thead>
          <tbody>
            {this.props.data.map((d,i) => <Stat key={'stat-' + i} data={d}/>)}
          </tbody>
        </table>
      </div>
    )
  }
});

//Contains the search functionality. and rendering of the StatTable.
var StatSearch = React.createClass({
  //Sets the initial searchTerm and searchCriteria
  getInitialState:function(){
    return ({title:'', org:'', stat:'', beginDate:'', endDate:''});
  },
  componentDidMount:function(){
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
    var RANGE = 'A2:D1000';

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
      var authorizeDiv = document.getElementById('authorize-div');
      if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        authorizeDiv.style.display = 'none';
        loadSheetsApi();
      } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        authorizeDiv.style.display = 'inline';
      }
    }

    /**
     * Initiate auth flow in response to user clicking authorize button.
     *
     * @param {Event} event Button click event.
     */
    function handleAuthClick(event) {
      gapi.auth.authorize(
        {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
        handleAuthResult);
      return false;
    }

    var test_data = [];

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
        if (range.values.length > 0) {
          // This part turns the array of arrays returned by the API into a JSON resembling the hardcoded 'test_data' object we had before.
          for (i = 0; i < range.values.length; i++) {
            var row = range.values[i];
            test_data[i] = {
              'title'     : row[0],
              'stat'      : row[1],
              'org'       : row[2],
              'pub_date'  : row[3]
            }
          }
        } else {
          console.log('No data found within the specified range.');
        }
      }, function(response) {
        console.log('Error. Sheets API response: ' + response.result.error.message);
      });
    }
  },
  // Sets the searchTerm and searchCriteria to the event's value and id, respectively.
  // This determines what will be searched and what that search will be on.
  filter:function(event){
    var obj = {};
    obj[event.target.id] = event.target.value;
    this.setState(obj);
  },
  // renders the StatSearch component.
  render:function() {
      var stats = this.props.data; //passed in value

      for (var searchCriteria in this.state)
      {
        var searchTerm = this.state[searchCriteria];
        if (searchTerm.length > 0)
        {
          if (searchCriteria == 'beginDate')
          {
            var beginElements = searchTerm.split("-");
            var beginDate = new Date(beginElements[0], beginElements[1], beginElements[2]);
            stats = stats.filter(function(stat) {
              var statElements = stat['published'].split("/");
              var date = new Date(statElements[2], statElements[0], statElements[1]);
              if (date > beginDate)
                return stat;
              else
                return null;
            });
          }
          else if (searchCriteria == 'endDate')
          {
            var endElements = searchTerm.split("-");
            var endDate = new Date(endElements[0], endElements[1], endElements[2]);
            stats = stats.filter(function(stat) {
              var statElements = stat['published'].split("/");
              var date = new Date(statElements[2], statElements[0], statElements[1]);
              if (date < endDate)
                return stat;
              else
                return null;
            });
          }
          else
          {
            searchTerm = searchTerm.trim();
            stats = stats.filter(function(stat){
              if (stat[searchCriteria].toLowerCase().includes(searchTerm.toLowerCase())){
                return stat;
              }
              else{
                return null;
              }
            });
          }
        }
      }

      return(
          <div className='row'>
            <div className="input-field col s6">
              <input placeholder="Enter a Title" id="title" type="text" className="validate" onChange={this.filter}></input>
              <label id="title_lable">Title Search</label>
            </div>
            <div className="input-field col s6">
              <input placeholder="Enter an Organization" id="org" type="text" className="validate" onChange={this.filter}></input>
              <label id="title_lable">Org Search</label>
            </div>
            <div className="input-field col s12">
              <input placeholder="Enter a Stat" id="stat" type="text" className="validate" onChange={this.filter}></input>
              <label id="title_lable">Stat Search</label>
            </div>
            <div className="input-field col s6">
              <input placeholder='begin date' id="beginDate" type="date" onChange={this.filter}></input>
            </div>
            <div className="input-field col s6">
              <input placeholder='endDate' id="endDate" type="date" onChange={this.filter}></input>
            </div>
            <div className='col s12'>
              <StatTable data={stats}/>
            </div>
          </div>
      )
  }
});

//Contains the Stat-adding feature
var AddStat = React.createClass({
  // An array storing the submission in the following order:
  // source,org, published, entryType, stat, topicTags[]
  submission: {
    title     : '',
    source    : '',
    org       : '',
    published : '',
    entryType : '',
    stat      : '',
    topicTags : ''
  },

  saveInput: function(event){
    var inputId = event.target.id;
    this.submission[inputId] = event.target.value;
    console.log(this.submission[inputId]);
  },

/* parse comma separated tag list into an array
  saveTags: function(event) {
    this.submission[event.target.id] = event.target.value.split(', ');
  },
  */

  submit: function(event) {
    event.preventDefault();
    gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId     : SPREADSHEET_ID,
      range             : RANGE,
      insertDataOption  : 'INSERT_ROWS',
      valueInputOption  : 'USER_ENTERED',
      values            : [
        [
          this.submission.title,
          this.submission.source,
          this.submission.org,
          this.submission.published,
          this.submission.entryType,
          this.submission.stat,
          this.submission.topicTags
        ]
      ]
    // Success callback
    }).then(function(response) {
      alert("Updated cell count" : response.result.updates.updatedCells);
    // Error callback
    }, function(response) {
      console.log('Error. Sheets API response: ' + response.result.error.message);
    });
  },

  // renders the adding Stat form
  render:function() {
      return(
          <div className='row'>
            <form onSubmit={this.submit}>
              <div className="input-field col s6">
                <input placeholder="Add Title..." id="title" type="text" className="validate" onBlur={this.saveInput}></input>
                <label id="title_lable">Title</label>
              </div>
              <div className="input-field col s6">
                <input placeholder="Add Source URL..." id="source" type="text" className="validate" onBlur={this.saveInput}></input>
                <label id="title_lable">Source</label>
              </div>
              <div className="input-field col s6">
                <input placeholder="Add Organization..." id="org" type="text" className="validate" onBlur={this.saveInput}></input>
                <label id="title_lable">Organization</label>
              </div>
              <div className="input-field col s6">
                <input placeholder="Add Publish Date..." id="published" type="text" className="validate" onBlur={this.saveInput}></input>
                <label id="title_lable">Publish Date</label>
              </div>
              <div className="input-field col s6">
                <input placeholder="Study or Article?" id="entryType" type="text" className="validate" onBlur={this.saveInput}></input>
                <label id="title_lable">Entry Type</label>
              </div>
              <div className="input-field col s6">
                <input placeholder="Stat" id="stat" type="text" className="validate" onBlur={this.saveInput}></input>
                <label id="title_lable">Stat</label>
              </div>
              <div className="input-field col s6">
                <input placeholder="Tags" id="topicTags" type="text" className="validate" onBlur={this.saveInput}></input>
                <label id="title_lable">Tags</label>
              </div>
              <button type="submit">Submit</button>
            </form>
          </div>
      )
  }
});


var test_data1 = [
  {
  'title':'Cost of Cyber Crime',
  'org':'Ponemon Institute',
  'published': '10/09/2016',
  'stat': 'Average annual losses to companies worldwide now exceed $7.7 million, with studied companies losing up to $65 million.',
  },
  {
  'title':'Cost of Cyber Crime',
  'org':'Ponemon Institute',
  'published': '11/09/2016',
  'stat': 'Average annual losses to companies worldwide now exceed $7.7 million, with studied companies losing up to $65 million.',
  },
  {
  'title':'How Much for this Breach?',
  'org':'Ponemon Institute',
  'published': '10/09/2016',
  'stat': '$7.7 million, with studied companies losing up to $65 million.',
  },
  {
  'title':'Can you believe it\'s not butter?',
  'org':'Ponemon Institute',
  'published': '10/09/2016',
  'stat': 'Studied companies losing up to $65 million.',
  },
  {
  'title':'Can you believe it\'s not butter?',
  'org':'Ponemon Institute',
  'published': '9/09/2016',
  'stat': 'Studied companies losing up to $65 million.',
  },
  {
  'title':'Can you believe it\'s not butter?',
  'org':'Ponemon Institute',
  'published': '10/09/2015',
  'stat': 'Studied companies losing up to $65 million.',
  },
  {
  'title':'Can you believe it\'s not butter?',
  'org':'Institute',
  'published': '10/09/2015',
  'stat': 'Studied companies losing up to $65 million.',
  },
  {
  'title':'Can you believe it\'s not butter?',
  'org':'Verizon',
  'published': '10/09/2015',
  'stat': 'Studied companies losing up to $65 million.',
  },
];


// The ReactDOM.render renders components to the dom. It takes 2 args:
// 1. Component(s) to be rendered and 2. Location to render specified component(s)
ReactDOM.render(
  <div>
    <StatSearch data={test_data} />
    <AddStat />
  </div>,
    document.querySelector('#root')
);
