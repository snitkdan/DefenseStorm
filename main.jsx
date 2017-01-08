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
                <tr id={'Stat-' + this.props.id}>
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
                        {this.props.data.map((d, i) => <Stat edit={this.props.edit} delete={this.props.delete} key={'stat-' + i} id={i} data={d}/>)}
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
                <AddStat delete = {this.delete} edit={this.edit} edit_data={this.state.edit_data} />
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
                        <br></br>
                        <div className='row'>
                            <div className="input-field col s3">
                                <input placeholder='begin date' id="beginDate" type="date" onChange={this.props.filter}></input>
                            </div>
                            <br></br>
                            <div className="input-field col s3">
                                <input placeholder='end date' id="endDate" type="date"  onChange={this.props.filter}></input>
                            </div>
                            <div className="input-field col s6">
                                <input placeholder='Comma,Separated,Tags' id="topicTags" type="text" onChange={this.props.filter}></input>
                            </div>
                        </div>
                        <div className='row'>
                            <label className='col s3'>Begin Date</label>
                            <label className='col s3'>End Date</label>
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
        return ({
            statsToAdd: [
                {
                    title:'',
                    source:'',
                    org:'',
                    published:'',
                    stat:'',
                    topicTags:'',
                    rowNum:''
                }
            ],
            buttonText:'Add',
            currStat: 0
        });
    },

    componentWillReceiveProps:function(nextProps){
        var data = nextProps.edit_data;
        if (data) {
            this.setState({
                statsToAdd: [
                    {
                        title: data.title,
                        source: data.source,
                        org: data.org,
                        published: data.published,
                        stat: data.stat,
                        topicTags: data.topicTags,
                        rowNum:data.rowNum
                    }
                ],
                buttonText:'Edit',
                currStat: 0
            });
        }
    },

    componentDidMount: function() {
        $('body').css('overflow', 'default');
        $('body').css('width', 'initial');
    },

    submit: function() {
        var RANGE;
        var action;
        var statsToAdd = this.state.statsToAdd;
        var values = [[]];

        // Format values[][] properly based on whether we are adding a single stat, multiple, or editing
        // We are adding multiple stats
        if (this.state.buttonText == 'Add' && this.state.currStat > 0) {
            for (var i = 0; i < this.state.currStat; i++) {
                values[i] = [
                    statsToAdd[i]["title"],
                    statsToAdd[i]["source"],
                    statsToAdd[i]["org"],
                    statsToAdd[i]["published"],
                    window.currDate(),
                    statsToAdd[i]["stat"],
                    statsToAdd[i]["topictags"],
                    (window.lastRow + i + 1)
                ];
            }
            RANGE = 'A' + window.lastRow + ':H' + (window.lastRow + statsToAdd.length);
            console.log('range: ' + RANGE);
            console.log('statsToAdd.length: ' + statsToAdd.length);
            console.log('window.lastRow: ' + window.lastRow);
            action = 'append';
        // We are adding a single stat
        } else if (this.state.buttonText == 'Add' && this.state.currStat == 0) {
            values[0] = [
                statsToAdd[0]["title"],
                statsToAdd[0]["source"],
                statsToAdd[0]["org"],
                statsToAdd[0]["published"],
                window.currDate(),
                statsToAdd[0]["stat"],
                statsToAdd[0]["topictags"],
                (window.lastRow + 1)
            ];
            RANGE = 'A' + (window.lastRow + 1) + ':H' + (window.lastRow + 1);
            console.log('range: ' + RANGE);
            console.log('statsToAdd.length: ' + statsToAdd.length);
            console.log('window.lastRow: ' + window.lastRow);
            action = 'append';
        // We are editing a single stat
        } else {
            values[0] = [
                    statsToAdd[0]["title"],
                    statsToAdd[0]["source"],
                    statsToAdd[0]["org"],
                    statsToAdd[0]["published"],
                    window.currDate(),
                    statsToAdd[0]["stat"],
                    statsToAdd[0]["topictags"],
                    statsToAdd[0]["rowNum"]
            ];
            RANGE = 'A' + statsToAdd[0]["rowNum"] + ':H' + statsToAdd[0]["rowNum"];
            action = 'update';
        }

        gapi.client.sheets.spreadsheets.values[action]({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'USER_ENTERED',
            values: values
        // Success callback
        }).then(function(response) {
            window.response = response;
            console.log("Updated row count: " + response.result.updates.updatedRows);
            if (this.state.buttonText == 'Add') {
                window.lastRow = window.lastRow + response.result.updates.updatedRows;
            }
            //props: id,source,title,stat, topicTags, row, org, published, lastTouch
            for (var i = 0; i < statsToAdd.length; i++) {
              //console.log(statsToAdd[i]);
              var newStat = <Stat edit={this.props.edit} delete={this.props.delete} key={'stat-' + 0} id={0} data={statsToAdd[i]}/>;
              $('table').prepend(newStat);
            }
            //console.log(newStat);
        // Error callback
        }.bind(this), function(response) {
            window.response = response;
            console.log('Error, code 400: ' + response.result.error.message);
        });
    },

    clear: function() {
        this.setState({
            statsToAdd  :   [
                    {
                        title       :   '',
                        source      :   '',
                        org         :   '',
                        published   :   '',
                        stat        :   '',
                        topicTags   :   '',
                        rowNum      :   ''
                    }
                ],
            buttonText  :   'Add',
            currStat    :   0
        });
        $('#addStatForm').trigger('reset');
    },

    //Handles user input when editing a stat
    handleChange:function(event){
        var updatedArr = this.state.statsToAdd.slice();
        updatedArr[this.state.currStat][event.target.id] = event.target.value;
        this.setState({
            statsToAdd: updatedArr
        });
    },

    //Handles user input when editing a stat
    saveStat:function(event){
        if (this.state.buttonText == 'Add') {
            var updatedArr = this.state.statsToAdd.slice();
            var nextStat = this.state.currStat + 1;
            updatedArr[nextStat] = {
                title       :   this.state.statsToAdd[this.state.currStat]['title'],
                source      :   this.state.statsToAdd[this.state.currStat]['source'],
                org         :   this.state.statsToAdd[this.state.currStat]['org'],
                published   :   this.state.statsToAdd[this.state.currStat]['published'],
                stat        :   '',
                topicTags   :   this.state.statsToAdd[this.state.currStat]['topicTags'],
                rowNum      :   ''
            };
            this.setState({
                statsToAdd: updatedArr,
                currStat: nextStat
            });

            for (var i = 0; i < this.state.statsToAdd.length; i++) {
                console.log("saveStat result: " + this.state.statsToAdd[i]['stat']);
            }
        }
    },

    // renders the adding Stat form
    render: function() {
        return (
            <div id="addModal" className="modal bottom-sheet">
                <div className="modal-header">
                    <AddStatHeader data={this.state} />
                </div>
                <div className="modal-content">
                    <form id="addStatForm">
                        <div className='row'>
                            <div className="input-field col s3">
                                <input value={this.state.statsToAdd[this.state.currStat]["title"]} onChange={this.handleChange} placeholder="Add Title..." id='title' type="text" className="validate"></input>
                            </div>
                            <div className="input-field col s3">
                                <input value={this.state.statsToAdd[this.state.currStat]["source"]} onChange={this.handleChange} placeholder="Add Source URL..." id='source' type="text" className="validate"></input>
                            </div>
                            <div className="input-field col s3">
                                <input value={this.state.statsToAdd[this.state.currStat]["org"]} onChange={this.handleChange} placeholder="Add Organization..." id='org' type="text" className="validate"></input>
                            </div>
                            <div className="input-field col s3">
                                <input value={this.state.statsToAdd[this.state.currStat]["published"]} onChange={this.handleChange} placeholder="Add Publish Date..." id='published' type="date" className="validate" ></input>
                            </div>
                        </div>
                        <div className='row'>
                            <div className="input-field col s5">
                                <input value={this.state.statsToAdd[this.state.currStat]["stat"]} onChange={this.handleChange} placeholder="Stat" id='stat' type="text" className="validate" ></input>
                            </div>
                            <SaveStatButton buttonText={this.state.buttonText} saveStat={this.saveStat} />
                            <div className="input-field col s6">
                                <input value={this.state.statsToAdd[this.state.currStat]["topictags"]} onChange={this.handleChange} placeholder="Tags" id='topicTags' type="text" className="validate" ></input>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <a href="#!" id={this.state.buttonText} onClick={this.submit} className="waves-effect waves-green btn-flat">{this.state.buttonText}</a>
                    <a href="#!" onClick={this.clear} className="waves-effect waves-green btn-flat">Reset</a>
                    <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
                </div>
                <StatBatchPreviewModal statsToAdd={this.state.statsToAdd} currStat={this.currStat} />
            </div>
          )
      }
  });

var SaveStatButton = React.createClass({
    render: function() {
        if (this.props.buttonText == 'Add') {
            return (
                <a href="#!" id="saveStatButton" onClick={this.props.saveStat} className="waves-effect waves-green btn-flat col s1">
                    <i className="material-icons">add</i>
                </a>
            );
        }
        return null;
    }
});

var AddStatHeader = React.createClass({
    render: function() {
        if (this.props.data.buttonText == 'Add') {
            return (
                <h5 className="modal-header">
                    Add a stat (
                        <a href='#statBatchPreviewModal'>{this.props.data.currStat} in batch</a>
                    )
                    <i className="material-icons right">add</i>
                </h5>
            );
        } else {
            return (
                <h5 className="modal-header">
                    Edit a stat
                    <i className="material-icons right">edit</i>
                </h5>
            );
        }
    }
});

var StatBatchPreviewModal = React.createClass({
    render: function() {
        return(
            <div id="statBatchPreviewModal" className="modal">
                <div className="modal-content">
                    <table className='pure-table pure-table-bordered pure-table-striped'>
                        <thead>
                            <tr>
                                <th className='center-align'>Title</th>
                                <th className='center-align'>Stat</th>
                                <th className='center-align'>Organization</th>
                                <th className='center-align'>Date Published</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.statsToAdd.map((d, i) => <Stat edit={null} delete={null} key={'preview-' + i} data={d}/>)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
});

// The ReactDOM.render renders components to the dom. It takes 2 args:
// 1. Component(s) to be rendered and 2. Location to render specified component(s)
var renderTable = function() {
  ReactDOM.render(<StatSearch data={test_data}/>, document.querySelector('#root'));
}
