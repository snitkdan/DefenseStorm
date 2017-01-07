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
    getInitialState: function() {
        return ({
            isDeleted: false
        });
    },

    // Delete Stat from the Google Sheet, and if successful, hide at client-side.
    // This makes it look as though the stat was deleted until test_data is updated to reflect the Sheet, i.e. by refreshing
    deleteAndHide: function(event) {
        this.props.delete(this.props.data).then(
            function(result) {
                this.setState({
                    isDeleted: result
                });
            }.bind(this), function(error) {
                console.log(error);
            }
        );
    },

    render: function() {
        if (!this.state.isDeleted) {
            return (
                <tr>
                    <td>
                        <a href={this.props.data.source}>{this.props.data.title}</a>
                    </td>
                    <td>
                        <p>{this.props.data.stat}</p>
                        Tags: {this.props.data.topicTags.split(',').map((d, i) => <div className='chip' key={this.props.row + '-tag-' + i}>{d}</div>)}
                    </td>
                    <td>{this.props.data.org}</td>
                    <td>{this.props.data.published}</td>
                    <td>{this.props.data.lastTouch}</td>
                    <td>
                        <button data-target='addModal' className="modal-trigger btn-floating btn-small waves-effect waves-light orange" onClick={() => this.props.edit(this.props.data)}>
                            <i className="material-icons">mode_edit</i>
                        </button>
                        <button className="btn-floating btn-small waves-effect waves-light red" onClick={this.deleteAndHide}>
                            <i className="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
            );
        }
        return null;
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
    getInitialState: function() {
        return ({sortCriteria: 'lastTouch', order: 1});
    },

    setSort: function(event) {
        if (event.target.id != this.state.sortCriteria) { 
            $('div#statTable table thead tr th#' + this.state.sortCriteria).removeClass('sortBy');
            $('div#statTable table thead tr th#' + event.target.id).addClass('sortBy');
        }
        this.setState({
            sortCriteria: event.target.id,
            order: this.state.order == 1 ? 0 : 1
        });
    },
    sortRows: function(order) {
        var sortCriteria = this.state.sortCriteria;
        var order = this.state.order;
        var sorted_Rows = this.props.data.sort(function(a, b) {
            var sortA = a[sortCriteria].trim().toLowerCase();
            var sortB = b[sortCriteria].trim().toLowerCase();
            if (sortCriteria == 'published' || sortCriteria =='lastTouch') {
                sortA = new Date(sortA);
                sortB = new Date(sortB);
            }
            if (order == 0) {
                if (sortA < sortB) {
                    return -1
                } else {
                    if (sortA > sortB) {
                        return 1;
                    }
                    else {
                      return a['rowNum'] < b['rowNum'] ? -1 : 1;
                    }
                }
            }
            else {
                if (sortA < sortB) {
                    return 1
                } else {
                    if (sortA > sortB) {
                        return -1;
                    }
                    else{
                      return a['rowNum'] < b['rowNum'] ? 1 : -1;
                    }
                }
            }
        });
        return sorted_Rows;
    },
    render: function() {
        if (this.props.data) {
            this.sortRows();
        }
        return (
            <div>
                <table className='pure-table pure-table-bordered pure-table-striped'>
                    <thead>
                        <tr>
                            <th className='center-align' data-field="title" id='title' onClick={this.setSort}>Title</th>
                            <th className='center-align' data-field="stat" id='stat' onClick={this.setSort}>Stat</th>
                            <th className='center-align' data-field="org" id='org' onClick={this.setSort}>Organization</th>
                            <th className='center-align' data-field="published" id='published' onClick={this.setSort}>Date Published</th>
                            <th className='center-align sortBy' data-field="lastTouch" id='lastTouch' onClick={this.setSort}>Date Added</th>
                            <th>test{/*this header is intentionally blank*/}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.data.map((d, i) => <Stat edit={this.props.edit} delete={this.props.delete} key={'stat-' + i} data={d}/>)}
                    </tbody>
                </table>
            </div>
        )
    }
});

//Contains the search functionality. and rendering of the StatTable.
var StatSearch = React.createClass({
    //Sets the initial searchTerm and searchCriteria
    getInitialState: function() {
        return ({
            title: '',
            org: '',
            stat: '',
            beginDate: '',
            endDate: '',
            topicTags: ''
        });
    },

    componentWillMount: function() {
        $(document).ready(function(){
            // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
            $('.modal').modal({
                opacity: 0,
                ready: function(modal, trigger) {
                    $('#logo').hide();
                    $('#sidebar').hide();
                    $('#statTable').removeClass('offset-s2');
                },
                complete: function() {
                    $('#logo').show();
                    $('#sidebar').show();
                    $('#statTable').addClass('offset-s2');
                }
            });
        });
    },

    // Sets the searchTerm and searchCriteria to the event's value and id, respectively.
    // This determines what will be searched and what that search will be on.
    filter: function(event) {
        if (event.target.id == 'topicTags' && event.target.value != '') {
            var tagArray = event.target.value.trim().toLowerCase().split(',');
            this.setState({topicTags: tagArray});
        } else if (event.target.id == 'clearSearch') {
            this.setState({
                title: '',
                org: '',
                stat: '',
                beginDate: '',
                endDate: '',
                topicTags: ''              
            });
            $('#searchStatForm').trigger('reset');
        } else {
            var obj = {};
            obj[event.target.id] = event.target.value;
            this.setState(obj);
        }
    },

    matchTags: function(haystack, arr) {
        return arr.some(function(v) {
            return haystack.indexOf(v) >= 0;
        });
    },

    edit: function(data) {
        this.setState({edit_data: data});
    },

    // Clear row in Google Sheet and return a Promise so we can hide the row on success */
    delete: function(data) {
        return(
            new Promise(function(resolve, reject){
                RANGE = 'A' + data.rowNum + ':G' + data.rowNum;
                gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: RANGE,
                    valueInputOption: 'USER_ENTERED',
                    values: [
                        [
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            ''
                        ]
                    ]
                    // Success callback
                }).then(
                    function(response) {
                        // Materialize.toast(message, displayLength, className, completeCallback);
                        Materialize.toast('Deleted stat #' + data.rowNum, 4000);
                        resolve(true);
                        // Error callback
                    }, function(response) {
                        Materialize.toast('Couldn\'t delete stat #' + data.rowNum + '. <a>(details)</a>', 4000);
                        reject(response.result.error.message);
                    }
                );
            })
        );

    },
    // renders the StatSearch component.
    render: function() {
        var stats = this.props.data;
        for (var searchCriteria in this.state) {
            var searchTerm = this.state[searchCriteria];
            if (searchTerm.length > 0) {
                if (searchCriteria == 'beginDate') {
                    var beginElements = searchTerm.split("-");
                    var beginDate = new Date(beginElements[0], beginElements[1], beginElements[2]);
                    stats = stats.filter(function(stat) {
                        var statElements = stat['published'].split("/");
                        var date = new Date(statElements[2], statElements[0], statElements[1]);
                        if (date >= beginDate)
                            return stat;
                        else
                            return null;
                        }
                    );
                } else if (searchCriteria == 'endDate') {
                    var endElements = searchTerm.split("-");
                    var endDate = new Date(endElements[0], endElements[1], endElements[2]);
                    stats = stats.filter(function(stat) {
                        var statElements = stat['published'].split("/");
                        var date = new Date(statElements[2], statElements[0], statElements[1]);
                        if (date <= endDate)
                            return stat;
                        else
                            return null;
                        }
                    );
                } else if (searchCriteria == 'topicTags') {
                    stats = stats.filter(function(stat) {
                        if (this.matchTags(stat[searchCriteria].toLowerCase().split(','), searchTerm)) {
                            return stat;
                        } else {
                            return null;
                        }
                    }.bind(this));

                } else {
                    searchTerm = searchTerm.trim();
                    stats = stats.filter(function(stat) {
                        if (stat[searchCriteria].toLowerCase().includes(searchTerm.toLowerCase())) {
                            return stat;
                        } else {
                            return null;
                        }
                    });
                }
            }
        }
        return (
            <div className='row'>
                <div className="left" id='sidebar'>
                    <div className='flex'>
                        <button id='search' data-target='searchModal' className="modal-trigger #e0e0e0 grey lighten-2 col s6 btn-large btn-large waves-effect waves-light red">
                            <i className="black-text material-icons">search</i>
                        </button>
                        <button id='add' data-target='addModal' className="modal-trigger #e0e0e0 grey lighten-2 col s6 btn-large btn-large waves-effect waves-light red">
                            <i className="black-text material-icons">add</i>
                        </button>
                    </div>
                </div>
                <AddStat edit_data={this.state.edit_data} />
                <SearchStat filter={this.filter} />
                <div id='statTable' className='col s12 offset-s2'>
                    <StatTable delete={this.delete} edit={this.edit} data={stats}/>
                </div>
            </div>
        );
    }
});

//Contains the search functionality
var SearchStat = React.createClass({
    // renders the StatSearch component.
    render: function() {
        return (
            <div id="searchModal" className="modal bottom-sheet">
                <div className="modal-header">
                    <h5 className="modal-header">
                        Search for an existing stat  
                        <i className="material-icons right">search</i>                     
                    </h5>                     
                </div>
                <div className="modal-content">
                    <form id='searchStatForm'>
                        <div className='row'>
                            <div className="input-field col s3">
                                <input placeholder="Enter a Title" id="title" type="text" className="validate" onLoadStart={this.props.filter} onChange={this.props.filter}></input>
                            </div>
                            <div className="input-field col s3">
                                <input placeholder="Enter an Organization" id="org" type="text" className="validate" onChange={this.props.filter}></input>
                            </div>
                            <div className="input-field col s6">
                                <input placeholder="Enter a Stat" id="stat" type="text" className="validate" onChange={this.props.filter}></input>
                            </div>
                        </div>
                        <div className='row'>
                            <div className="input-field col s3">
                                <input placeholder='begin date' id="beginDate" type="date" className='datepicker' onChange={this.props.filter}></input>
                            </div>
                            <div className="input-field col s3">
                                <input placeholder='endDate' id="endDate" type="date" className='datepicker' onChange={this.props.filter}></input>
                            </div>
                            <div className="input-field col s6">
                                <input placeholder='Comma,Separated,Tags' id="topicTags" type="text" onChange={this.props.filter}></input>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
                    <a href="#!" onClick={this.props.filter} id='clearSearch' className="waves-effect waves-green btn-flat">Clear</a>
                </div>
            </div>
        );
    }
});


//Contains the Stat-adding feature
var AddStat = React.createClass({

    getInitialState:function(){
      return ({title:'', source:'', org:'', published:'', entryType:'', stat:'', topicTags:'', rowNum:'', buttonText:'Add'});
    },

    componentWillReceiveProps:function(nextProps){
        var data = nextProps.edit_data;
        if (data) {
            this.setState({
                title: data.title,
                source: data.source,
                org: data.org,
                published: data.published,
                entryType: data.entryType,
                stat: data.stat,
                topicTags: data.topicTags,
                rowNum:data.rowNum,
                buttonText:'Edit'
            })
        }

    },

    submit: function(event) {
        event.preventDefault();
        console.log(this.state);
        var RANGE;
        var action;
        var values =
            [
                [
                    this.state.title,
                    this.state.source,
                    this.state.org,
                    this.state.published,
                    this.state.entryType,
                    this.state.stat,
                    this.state.topicTags
                ]
            ];

        if (this.state.buttonText == 'Add') {
            values[0].push(window.lastRow + 1);
            RANGE = 'A2:H1000';
            action = 'append';
        } else {
            RANGE = 'A' + this.state.rowNum + ':G' + this.state.rowNum;
            action = 'update';
        }

        gapi.client.sheets.spreadsheets.values[action]({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'USER_ENTERED',
            values: values
            // Success callback
        }).then(function(response) {
            console.log("Updated cell count" : response.result.updates.updatedCells);
            if (this.state.buttonText == 'Add') {
                window.lastRow++;
            }
            // Error callback
        }.bind(this), function(response) {
            console.log('Error. Sheets API response: ' + response.result.error.message);
        });
    },

    clear: function() {
        this.setState({
            title       : '',
            source      : '',
            org         : '',
            published   : '',
            entryType   : '',
            stat        : '',
            topicTags   : '',
            rowNum      : '',
            buttonText  : 'Add'
        });
        $('#addStatForm').trigger('reset');
    },

    // for saving the date the stat was modified
    // returns the local date
    // courtesy of http://stackoverflow.com/a/4929629
    currDate: function() {
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
        console.log(today);
        return today;
    },

    //Handles user input when editing a stat
    handlChange:function(event){
      var obj = {};
      obj[event.target.id] = event.target.value;
      this.setState(obj);
    },

    // renders the adding Stat form
    render: function() {
        return (
            <div id="addModal" className="modal bottom-sheet">
                <div className="modal-header">
                    <h5 className="modal-header">
                        {this.state.buttonText} a stat 
                        <i className="material-icons right">{this.state.buttonText.toLowerCase()}</i>                     
                    </h5>                    
                </div>
                <div className="modal-content">
                    <form id="addStatForm">
                        <div className='row'>
                            <div className="input-field col s3">
                                <input value={this.state.title} onChange={this.handlChange} placeholder="Add Title..." id="title" type="text" className="validate"></input>
                            </div>
                            <div className="input-field col s3">
                                <input value={this.state.source} onChange={this.handlChange} placeholder="Add Source URL..." id="source" type="text" className="validate"></input>
                            </div>
                            <div className="input-field col s3">
                                <input value={this.state.org} onChange={this.handlChange} placeholder="Add Organization..." id="org" type="text" className="validate"></input>
                            </div>
                            <div className="input-field col s3">
                                <input value={this.state.published} onChange={this.handlChange} placeholder="Add Publish Date..." id="published" type="text" className="validate" ></input>
                            </div>
                        </div>
                        <div className='row'>
                            <div className="input-field col s6">
                                <input value={this.state.stat} onChange={this.handlChange} placeholder="Stat" id="stat" type="text" className="validate" ></input>
                            </div>
                            <div className="input-field col s6">
                                <input value={this.state.topicTags} onChange={this.handlChange} placeholder="Tags" id="topicTags" type="text" className="validate" ></input>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <a href="#!" id={this.state.buttonText} onClick={this.submit} className="waves-effect waves-green btn-flat">{this.state.buttonText}</a>
                    <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
                    <a href="#!" onClick={this.clear} className="waves-effect waves-green btn-flat">Clear</a>
                </div>
            </div>
          )
      }
  });
/* <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Agree</a> 
                        <div className="modal-footer">
                            <button id={this.state.buttonText} onClick={this.submit}>{this.state.buttonText}</button>
                        </div>*/

// The ReactDOM.render renders components to the dom. It takes 2 args:
// 1. Component(s) to be rendered and 2. Location to render specified component(s)
var renderTable = function() {
  ReactDOM.render(
      <div>
      <StatSearch data={test_data}/>
  </div>, document.querySelector('#root'));
}
