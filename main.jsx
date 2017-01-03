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
                        {this.props.data.stat}<br/>
                        Tags: {this.props.data.topicTags.split(',').map((d, i) => <div className='chip' key={this.props.row + '-tag-' + i}>{d}</div>)}
                    </td>
                    <td>{this.props.data.org}</td>
                    <td>{this.props.data.published}</td>
                    <td>{this.props.data.lastTouch}</td>
                    <td className="actionButtons">
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

var SortButtons = React.createClass({
    render: function() {
        return (
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
    getInitialState: function() {
        return ({sortCriteria: 'lastTouch', order: 1});
    },

    setSort: function(event) {
        var results = event.currentTarget.id.split('-');
        var sortCriteria = results[0];
        var order = results[1];
        console.log('The sortCriteria is: ', event.target.id);
        var Order = this.state.order == 1 ? 0 : 1;
        console.log('The order is: ', Order);
        this.setState({sortCriteria: sortCriteria, order: Order});
    },
    sortRows: function(order) {
        var sortCriteria = this.state.sortCriteria;
        var order = this.state.order;
        var sorted_Rows = this.props.data.sort(function(a, b) {
            a = a[sortCriteria].trim().toLowerCase();
            b = b[sortCriteria].trim().toLowerCase();
            if (sortCriteria == 'published') {
                a = new Date(a);
                b = new Date(b);
            }
            if (order == 0) {
                if (a < b) {
                    return -1
                } else {
                    if (a > b) {
                        return 1;
                    }
                    return 0;
                }
            } else {
                if (a < b) {
                    return 1
                } else {
                    if (a > b) {
                        return -1;
                    }
                    return 0;
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
                            <th className='center-align' data-field="title"><a className='t-head' id='title' onClick={this.setSort}> Title</a></th>
                            <th className='center-align' data-field="stat"><a className='t-head' id='stat' onClick={this.setSort}> Stat</a></th>
                            <th className='center-align' data-field="org"><a className='t-head' id='org' onClick={this.setSort}>Organization</a></th>
                            <th className='center-align' data-field="published"><a className='t-head' id='published' onClick={this.setSort}>Date Published</a></th>
                            <th className='center-align' data-field="lastTouch"><a className='t-head' id='lastTouch' onClick={this.setSort}>Date Added</a></th>
                            <th className='actionButtons'>{/*this header is intentionally blank*/}</th>
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
        if (event.target.id == 'topicTags') {
            this.setState({topicTags: event.target.value.trim().split(',')});
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
                        <button onClick={this.switch} id='search' data-target='searchModal' className="modal-trigger #e0e0e0 grey lighten-2 col s6 btn-large btn-large waves-effect waves-light red">
                            <i className="black-text material-icons">search</i>
                        </button>
                        <button onClick={this.switch} id='add' data-target='addModal' className="modal-trigger #e0e0e0 grey lighten-2 col s6 btn-large btn-large waves-effect waves-light red">
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
                <div className="modal-content">
                    <div className='row'>
                        <div className="input-field col s6">
                            <input placeholder="Enter a Title" id="title" type="text" className="validate" onLoadStart={this.props.filter} onChange={this.props.filter}></input>
                        </div>
                        <div className="input-field col s6">
                            <input placeholder="Enter an Organization" id="org" type="text" className="validate" onChange={this.props.filter}></input>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="input-field col s12">
                            <input placeholder="Enter a Stat" id="stat" type="text" className="validate" onChange={this.props.filter}></input>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="input-field col s6">
                            <input placeholder='begin date' id="beginDate" type="date" className='datepicker' onChange={this.props.filter}></input>
                        </div>
                        <div className="input-field col s6">
                            <input placeholder='endDate' id="endDate" type="date" className='datepicker' onChange={this.props.filter}></input>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="input-field col s12">
                            <input placeholder='Comma,Separated,Tags' id="topicTags" type="text" onChange={this.props.filter}></input>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Agree</a>
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
        var action = this.state.buttonText == 'Add' ? 'append' : 'update'
        var RANGE = this.state.buttonText == 'Add' ? 'A2:H1000' : 'A' + this.state.rowNum + ':G' + this.state.rowNum;
        gapi.client.sheets.spreadsheets.values[action]({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'USER_ENTERED',
            values: [
                [
                    this.state.title,
                    this.state.source,
                    this.state.org,
                    this.state.published,
                    this.state.entryType,
                    this.state.stat,
                    this.state.topicTags
                ]
            ]
            // Success callback
        }).then(function(response) {
            alert("Updated cell count" : response.result.updates.updatedCells);
            this.clear();
            // Error callback
        }, function(response) {
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
                <div className="modal-content">
                    <form id="addStatForm">
                        <div className="input-field col s6">
                            <input value={this.state.title} onChange={this.handlChange} placeholder="Add Title..." id="title" type="text" className="validate"></input>
                        </div>
                        <div className="input-field col s6">
                            <input value={this.state.source} onChange={this.handlChange} placeholder="Add Source URL..." id="source" type="text" className="validate"></input>
                        </div>
                        <div className="input-field col s6">
                            <input value={this.state.org} onChange={this.handlChange} placeholder="Add Organization..." id="org" type="text" className="validate"></input>
                        </div>
                        <div className="input-field col s6">
                            <input value={this.state.published} onChange={this.handlChange} placeholder="Add Publish Date..." id="published" type="text" className="validate" ></input>
                        </div>
                        <div className="input-field col s6">
                            <input value={this.state.entryType} onChange={this.handlChange} placeholder="Study or Article?" id="entryType" type="text" className="validate" ></input>
                        </div>
                        <div className="input-field col s6">
                            <input value={this.state.stat} onChange={this.handlChange} placeholder="Stat" id="stat" type="text" className="validate" ></input>
                        </div>
                        <div className="input-field col s6">
                            <input value={this.state.topicTags} onChange={this.handlChange} placeholder="Tags" id="topicTags" type="text" className="validate" ></input>
                        </div>
                        <div className="modal-footer">
                            <button id={this.state.buttonText} onClick={this.submit}>{this.state.buttonText}</button>
                        </div>
                    </form>
                </div>
            </div>
          )
      }
  });
/* <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Agree</a> */

// The ReactDOM.render renders components to the dom. It takes 2 args:
// 1. Component(s) to be rendered and 2. Location to render specified component(s)
var renderTable = function() {
  ReactDOM.render(
      <div>
      <StatSearch data={test_data}/>
  </div>, document.querySelector('#root'));
}
