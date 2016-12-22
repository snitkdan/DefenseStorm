/* sheets.js populates test_data[] from a live Google Spreadsheet
 * The attributes in that spreadsheet are thus:
 *
 *    'title'     : column A
 *    'source'    : column B
 *    'org'       : column C
 *    'published' : column D
 *    'lastTouch' : column E
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
 *         'lastTouch'  : '',
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
        <td>
          {this.props.data.stat}<br />
          Tags: {this.props.data.topicTags}
        </td>
        <td>{this.props.data.org}</td>
        <td>{this.props.data.published}</td>
        <td>{this.props.data.lastTouch}</td>
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
    return ({sortCriteria:'lastTouch', order:1});
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
      if(sortCriteria == 'published' || sortCriteria == 'lastTouch'){
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
                <th className='center-align' data-field="lastTouch">Last Touch<SortButtons id='lastTouch' clickEvent={this.setSort}/></th>
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
    return ({title:'', org:'', stat:'', beginDate:'', endDate:'', topicTags:''});
  },
  componentDidMount:function(){
      $('#add_field').hide();
  },
  // Sets the searchTerm and searchCriteria to the event's value and id, respectively.
  // This determines what will be searched and what that search will be on.
  filter:function(event){
    if (event.target.id == 'topicTags')
    {
      this.setState({topicTags : event.target.value.trim().split(',')});
    }
    else
    {
    console.log('in filter');
    var obj = {};
    obj[event.target.id] = event.target.value;
    this.setState(obj);
    }
  },

  matchTags:function (haystack, arr) {
    return arr.some(function (v) {
        return haystack.indexOf(v) >= 0;
    });
  },

  switch:function(event){
    var id = event.target.id;
    if(id =='search'){
      $('#search_field').show();
      $('#add_field').hide();
    }
    else{
      $('#search_field').hide();
      $('#add_field').show();
    }
  },

  // renders the StatSearch component.
  render:function() {
      var stats = this.props.data;
      console.log(stats);

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
              if (date >= beginDate)
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
              if (date <= endDate)
                return stat;
              else
                return null;
            });
          }
          else if (searchCriteria == 'topicTags') 
          {
            stats = stats.filter(function(stat){
              if (this.matchTags(stat[searchCriteria].toLowerCase().split(','), searchTerm)){
                return stat;
              }
              else{
                return null;
              }
            }.bind(this));
              
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
          <div className="left">  
            <div className='flex'>
              <button onClick={this.switch} id='search' className="#e0e0e0 grey lighten-2 col s6 btn-large btn-large waves-effect waves-light red"><i className="black-text material-icons">search</i></button>
              <button onClick={this.switch} id='add' className="#e0e0e0 grey lighten-2 col s6 btn-large btn-large waves-effect waves-light red"><i className="black-text material-icons">add</i></button>
            </div>
          
            <div className='row' id='search_field'>
              <div className="input-field col s6">
                <input placeholder="Enter a Title" id="title" type="text" className="validate" onLoadStart={this.filter} onChange={this.filter}></input>
              </div>
              <div className="input-field col s6">
                <input placeholder="Enter an Organization" id="org" type="text" className="validate" onChange={this.filter}></input>
              </div>
            </div>
            <div className='row'>
              <div className="input-field col s12">
                <input placeholder="Enter a Stat" id="stat" type="text" className="validate" onChange={this.filter}></input>
              </div>
            </div>
            <div className='row'>
              <div className="input-field col s6">
                <input placeholder='begin date' id="beginDate" type="date" onChange={this.filter}></input>
              </div>
              <div className="input-field col s6">
                <input placeholder='endDate' id="endDate" type="date" onChange={this.filter}></input>
              </div>
            </div>
            <div className='row'>
              <div className="input-field col s12">
                <input placeholder='Comma,Separated,Tags' id="topicTags" type="text" onChange={this.filter}></input>
              </div>
            </div>
          
            <div className='row' id="add_field">
              <AddStat />
            </div>
          </div>
          <div className='col s12 offset-s2'>
            <StatTable data={stats}/>
          </div>
        </div>
      )
  }
});

//Contains the Stat-adding feature
var AddStat = React.createClass({
  // An array storing the submission in the following order:
  // source,org, published, lastTouch, stat, topicTags[]
  submission: {
    title     : '',
    source    : '',
    org       : '',
    published : '',
    lastTouch : '',
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
          this.currDate(),
          this.submission.stat,
          this.submission.topicTags
        ]
      ]
    // Success callback
    }).then(function(response) {
      alert("Updated cell count: " + response.result.updates.updatedCells);
    // Error callback
    }, function(response) {
      console.log('Error. Sheets API response: ' + response.result.error.message);
    });
  },

  // for saving the date the stat was modified
  // returns the local date
  // courtesy of http://stackoverflow.com/a/4929629
  currDate:function() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd
	} 

	if(mm<10) {
	    mm='0'+mm
	} 

	today = mm+'/'+dd+'/'+yyyy;
	console.log(today);
	return today;
  },

  // renders the adding Stat form
  render:function() {
      return(
          <div>
            <form onSubmit={this.submit}>
              <div className="left">  
                <div className="input-field col s6">
                  <input placeholder="Add Title..." id="title" type="text" className="validate" onBlur={this.saveInput}></input>
                </div>
                <div className="input-field col s6">
                  <input placeholder="Add Source URL..." id="source" type="text" className="validate" onBlur={this.saveInput}></input>
                </div>
                <div className="input-field col s6">
                  <input placeholder="Add Organization..." id="org" type="text" className="validate" onBlur={this.saveInput}></input>
                </div>
                <div className="input-field col s6">
                  <input placeholder="Add Publish Date..." id="published" type="text" className="validate" onBlur={this.saveInput}></input>
                </div>
                <div className="input-field col s6">
                  <input placeholder="Stat" id="stat" type="text" className="validate" onBlur={this.saveInput}></input>
                </div>
                <div className="input-field col s6">
                  <input placeholder="Tags" id="topicTags" type="text" className="validate" onBlur={this.saveInput}></input>
                </div>
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
      )
  }
});

// The ReactDOM.render renders components to the dom. It takes 2 args:
// 1. Component(s) to be rendered and 2. Location to render specified component(s)
var renderTable = function(){
  ReactDOM.render(
    <div>
      <StatSearch data={test_data} />
    </div>,
      document.querySelector('#root')
  );
}
