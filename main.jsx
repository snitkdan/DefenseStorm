/* sheets.js gets this data from a live sheet, now.

// Each entry has a 'title', 'stat', 'org', and 'pub_date'
var test_data = [
  {'title': 'Cost of Cyber Crime 2014', 'stat': 'Average annual losses to companies worldwide now exceed $7.7 million, with studied companies losing up to $65 million.', 'org':'Ponemon Institute', 'pub_date': '10/09/2016'},
  {'title': 'Verizon Report 2014', 'stat': 'Two-thirds of respondents identified cyber risk as one of their top five concerns - an increase of 25 points since March 2014', 'org': 'Verizon', 'pub_date': '10/20/2016'},
  {'title': 'Cost of Cyber Crime 2015', 'stat': 'Average annual losses to companies worldwide now exceed $7.7 million, with studied companies losing up to $65 million.', 'org':'Ponemon Institute', 'pub_date': '10/09/2016'},
  {'title': 'Best way to break a firewall', 'stat': 'Average annual losses to companies worldwide now exceed $7.7 million, with studied companies losing up to $65 million.', 'org':'Ponemon Institute', 'pub_date': '10/09/2016'},
  {'title': 'Cost of Breaches again!', 'stat': 'Two-thirds of respondents identified cyber risk as one of their top five concerns - an increase of 25 points since March 2014', 'org': 'Verizon', 'pub_date': '10/20/2016'},

]
*/

/* This is a React component for an individual Stat, which is a row in the "StatTable" component.
   The properties that it gets is "data", which is an individual JS object that has properties
  'title', 'stat', 'org', and 'pub_date', all of which get rendered in with <td> tags. */
var Stat = React.createClass({
  render:function(){
    return(
      <tr>
        <td>{this.props.data.title}</td>
        <td>{this.props.data.stat}</td>
        <td>{this.props.data.org}</td>
        <td>{this.props.data.pub_date}</td>
      </tr>
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
  render:function(){
    return(
      <div>
        <table className='striped'>
          <thead>
            <tr>
                <th className='center-align' data-field="title">Title</th>
                <th className='center-align' data-field="stat">Stat</th>
                <th data-field="org">Organization</th>
                <th data-field="pub_date">Date Published</th>
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
        console.log(searchCriteria);
        var searchTerm = this.state[searchCriteria];
        console.log(searchTerm);
        if (searchTerm.length > 0)
        {
          if (searchCriteria == 'beginDate')
          {
            var beginElements = searchTerm.split("-");
            var beginDate = new Date(beginElements[0], beginElements[1], beginElements[2]);
            console.log("begin Date:");
            console.log(beginDate);
            stats = stats.filter(function(stat) {
              var statElements = stat['pub_date'].split("/");
              var date = new Date(statElements[2], statElements[0], statElements[1]);
              console.log("Date:");
              console.log(date);
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
            console.log("End Date:");
            console.log(endDate);
            stats = stats.filter(function(stat) {
              var statElements = stat['pub_date'].split("/");
              var date = new Date(statElements[2], statElements[0], statElements[1]);
              console.log("Date:");
              console.log(date);
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
              var result = stat[searchCriteria].match("/" + searchTerm + "/i");
              if (result)
                return stat;
              else
                return null;
            });
          }
        }
      }

      return(
          <div className='row'>
            <div className="input-field col s6">
              <input placeholder="Enter a Title" id="title" type="text" className="validate" onChange={this.filter}></input>
              <label>Title Search</label>
            </div>
            <div className="input-field col s6">
              <input placeholder="Enter an Organization" id="org" type="text" className="validate" onChange={this.filter}></input>
              <label>Org Search</label>
            </div>
            <div className="input-field col s6">
              <input placeholder="Enter a Stat" id="stat" type="text" className="validate" onChange={this.filter}></input>
              <label>Stat Search</label>
            </div>
            <div className="input-field col s3">
              <input id="beginDate" type="date" onChange={this.filter}></input>
            </div>
            <div className="input-field col s3">
              <input id="endDate" type="date" onChange={this.filter}></input>
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
    source: '',
    org: '',
    published: '',
    entryType: '',
    stat: '',
    topicTags: []
  },

  saveInput: function(event){
    var inputId = event.target.id;
    this.submission[inputId] = event.target.value;
    console.log(this.submission[inputId]);
  },

  saveTags: function(event) {
    this.submission[event.target.id] = event.target.value.split(', ');
  },

  submit: function(event) {
    gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      insertDataOption: 'INSERT_ROWS',
      valueInputOption: 'USER_ENTERED',
      values: [
        ['blah1', 'blah2', 'blah3', 'blah4']
      ]
    // Success callback
    }).then(function(response) {
      alert(response.updates.updatedCells);
    // Error callback
    }, function(response) {
      console.log('Error. Sheets API response: ' + response.result.error.message);
    });
  },

  // renders the adding Stat form
  render:function() {
      return(
          <div className='row'>
            <form>
              <div className="input-field col s6">
                <input placeholder="Add Source URL..." id="source" type="text" className="validate" onBlur={this.saveInput}></input>
                <label>Source</label>
              </div>
              <div className="input-field col s6">
                <input placeholder="Add Organization..." id="org" type="text" className="validate" onBlur={this.saveInput}></input>
                <label>Organization</label>
              </div>
              <div className="input-field col s6">
                <input placeholder="Add Publish Date..." id="published" type="text" className="validate" onBlur={this.saveInput}></input>
                <label>Publish Date</label>
              </div>
              <div className="input-field col s6">
                <input placeholder="Study or Article?" id="entryType" type="text" className="validate" onBlur={this.saveInput}></input>
                <label>Entry Type</label>
              </div>
              <div className="input-field col s6">
                <input placeholder="Stat" id="stat" type="text" className="validate" onBlur={this.saveInput}></input>
                <label>Stat</label>
              </div>
              <div className="input-field col s6">
                <input placeholder="Tags" id="topicTags" type="text" className="validate" onBlur={this.saveInput}></input>
                <label>Tags</label>
              </div>
              <button onClick={this.submit}>Submit</button>
            </form>
          </div>
      )
  }
});

// The ReactDOM.render renders components to the dom. It takes 2 args:
// 1. Component(s) to be rendered and 2. Location to render specified component(s)
ReactDOM.render(
  <div>
    <StatSearch data={test_data} />
    <AddStat />
  </div>,
    document.querySelector('#root')
);