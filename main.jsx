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
    return ({searchTerm:'', searchCriteria:'title'});
  },
  // Sets the searchTerm and searchCriteria to the event's value and id, respectively.
  // This determines what will be searched and what that search will be on.
  filter:function(event){
    this.setState({searchTerm:event.target.value, searchCriteria:event.target.id});
  },
  // renders the StatSearch component.
  render:function() {
      var stats = this.props.data; //passed in value
      var searchTerm = this.state.searchTerm.trim(); //set by either getInitialState or filter
      var searchCriteria = this.state.searchCriteria.trim(); //set by either getInitialState or filter

      if(searchTerm.length > 0){
         // set the Stat entries to be displayed as those that match the 'searchTerm'(i.e. 'Verizon Report')
         // for the specified 'searchCriteria'(i.e. "title").
         stats = stats.filter(function(stat){
             return stat[searchCriteria].match( searchTerm );
         });
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
            <div className="input-field col s12">
              <input placeholder="Enter a Stat" id="stat" type="text" className="validate" onChange={this.filter}></input>
              <label>Stat Search</label>
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
  // org, published, entryType, stat, topicTags[]
  submission: [],

  saveInput: function(index, inputId) {
    console.log(inputId);
    var input_val = $('#' + inputId).val();
    console.log(input_val);
  },

  submit: function() {
    alert('submitted ' + this.submission[0]);
  },

  // renders the adding Stat form
  render:function() {
      return(
          <div className='row'>
            <div className="input-field col s6">

                <input placeholder="Add Source URL..." id="AddSourceUrl" type="text" className="validate" onChange={this.saveInput(0, 'AddSourceUrl')}></input>
                <label>Source</label>
                <button onClick={this.submit}>Submit</button>
            </div>
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
