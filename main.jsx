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

    hide: function() {
        this.setState({
            isDeleted: true
        });
    },

    render: function() {
        if (!this.state.isDeleted) {
            return (
                <tr>
                    <td>
                        <a href={this.props.data.source} target='_blank'>{this.props.data.title}</a>
                    </td>
                    <td>
                        <p>{this.props.data.stat}</p>
                        <TagList topicTags={this.props.data.topicTags} />
                    </td>
                    <td>{this.props.data.org}</td>
                    <td>{this.props.data.published}</td>
                    <td>{this.props.data.lastTouch}</td>
                    <td>
                        <button data-target='addModal' className="modal-trigger btn-floating btn-small waves-effect waves-light" onClick={() => this.props.edit(this.props.data)}>
                            <i className="material-icons">mode_edit</i>
                        </button>
                        <button className="btn-floating btn-small waves-effect waves-light" onClick={this.deleteAndHide}>
                            <i className="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
            );
        }
        return null;
    }
});

var TagList = React.createClass({
	getInitialState:function(){
		console.log('topicTags: ' + this.props.topicTags);
		if (this.props.topicTags != undefined && this.props.topicTags != '') {
			return ({
				topicTags: this.props.topicTags.trim().split(',')
			});
		}
		return ({
			topicTags: []
		});
	},

    componentWillReceiveProps:function(nextProps){
        var newTopicTags = nextProps.topicTags;
        console.log('newTopicTags: ' + newTopicTags);
        if (newTopicTags != undefined && newTopicTags != '') {
            this.setState({
                topicTags: newTopicTags.trim().split(',')
            });
        }
        console.log('this.state.topicTags: ' + this.state.topicTags);
    },

	render: function() {
		return(
			<div className='tagList'>
				{this.state.topicTags.map((d, i) => <div className='chip' key={i}>{d}</div>)}
			</div>
		);
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
        return ({sortCriterion: 'lastTouch', order: 1});
    },

    setSort: function(event) {
        if (event.target.id != this.state.sortCriterion) {
            $('div#statTable table thead tr th#' + this.state.sortCriterion).removeClass('sortBy');
            $('div#statTable table thead tr th#' + event.target.id).addClass('sortBy');
        }
        this.setState({
            sortCriterion: event.target.id,
            order: this.state.order == 1 ? 0 : 1
        });
    },
    sortRows: function(order) {
        var sortCriterion = this.state.sortCriterion;
        var order = this.state.order;
        var sorted_Rows = this.props.data.sort(function(a, b) {
            if (a[sortCriterion] == undefined) {
            }
            if (b[sortCriterion] == undefined) {
            }
            var sortA = a[sortCriterion].trim().toLowerCase();
            var sortB = b[sortCriterion].trim().toLowerCase();
            if (sortCriterion == 'published' || sortCriterion =='lastTouch') {
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
    //Sets the initial search term and criteria
    getInitialState: function() {
        return ({
            searchCriteria: {
                title: '',
                org: '',
                stat: '',
                beginDate: '',
                endDate: '',
                topicTags: '',
            },
            stats: this.props.data
        });
    },

    componentDidMount: function() {
        // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
        $('#searchModal, #addModal').modal({
            opacity: 0,
            ready: function(modal, trigger) {
                $('div.navbar-fixed').hide('slow');
            },
            complete: function() {
                $('div.navbar-fixed').show('slow');
            }
        });
        $('#statBatchPreviewModal').modal({
            opacity: 0,
            ready: function(modal, trigger) {
            },
            complete: function() {
            }
        });
    },

    // Sets the searchTerm and searchCriterion to the event's value and id, respectively.
    // This determines what will be searched and what that search will be on.
    filter: function(event) {
        if (event.target.id == 'topicTags' && event.target.value != '') {
            var tagArray = event.target.value.trim().toLowerCase().split(',');
            this.setState({
                searchCriteria: {
                    title: this.state.searchCriteria.title,
                    org: this.state.searchCriteria.org,
                    stat: this.state.searchCriteria.stat,
                    beginDate: this.state.searchCriteria.beginDate,
                    endDate: this.state.searchCriteria.endDate,
                    topicTags: tagArray
                }
            });
        } else if (event.target.id == 'clearSearch') {
            this.setState({
                searchCriteria: {
                    title: '',
                    org: '',
                    stat: '',
                    beginDate: '',
                    endDate: '',
                    topicTags: ''
                }
            });
            $('#searchStatForm').trigger('reset');
        } else {
            var newSearchCriteria = {
                title: this.state.searchCriteria.title,
                org: this.state.searchCriteria.org,
                stat: this.state.searchCriteria.stat,
                beginDate: this.state.searchCriteria.beginDate,
                endDate: this.state.searchCriteria.endDate,
                topicTags: this.state.searchCriteria.topicTags
            };
            newSearchCriteria[event.target.id] = event.target.value;
            this.setState({
                searchCriteria: newSearchCriteria
            });
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

    insertStats: function(newStats) {
        this.setState({
            stats: this.state.stats.concat(newStats)
        });
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
                        Materialize.toast('Couldn\'t delete stat #' + data.rowNum, 4000);
                        console.log("Couldn't delete stat: " + response.result.error.message);
                        reject(response.result.error.message);
                    }
                );
            })
        );

    },
    // renders the StatSearch component.
    render: function() {
        var stats = this.state.stats;
        for (var searchCriterion in this.state.searchCriteria) {
            var searchTerm = this.state.searchCriteria[searchCriterion];

            if (searchTerm.length > 0) {
                if (searchCriterion == 'beginDate') {
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
                } else if (searchCriterion == 'endDate') {
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
                } else if (searchCriterion == 'topicTags') {
                    stats = stats.filter(function(stat) {
                        if (this.matchTags(stat[searchCriterion].toLowerCase().split(','), searchTerm)) {
                            return stat;
                        } else {
                            return null;
                        }
                    }.bind(this));

                } else {
                    searchTerm = searchTerm.trim();
                    stats = stats.filter(function(stat) {
                        if (stat[searchCriterion].toLowerCase().includes(searchTerm.toLowerCase())) {
                            return stat;
                        } else {
                            return null;
                        }
                    });
                }
            }
        }

        return (
            <div>
                <div className="navbar-fixed">
                    <nav>
                        <div className="nav-wrapper">
                            <a href="#!" className="brand-logo">
                                <img id='logo' className="" src='imgs/DefenseStorm_horz_bk.png' alt='DefenseStorm logo' />
                            </a>
                            <ul className="right">
                                <li>
                                    <a id='search' href='#searchModal' className="modal-trigger">
                                        <i className="black-text material-icons large">search</i>
                                    </a>                            
                                </li>
                                <li>
                                    <a id='add' data-target='addModal' className="modal-trigger">
                                        <i className="black-text material-icons large">add</i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>                
                <AddStat edit_data={this.state.edit_data} insertStats={this.insertStats}/>
                <SearchStat filter={this.filter} />
                <div id='statTable' className='col s12'>
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
           		<form id='searchStatForm'>
	                <div className="modal-header">
	                    <h5 className="modal-header">
	                        Search for an existing stat
	                        <i className="material-icons right">search</i>
	                    </h5>
	                </div>
	                <div className="modal-content">
                        <div className='row'>
                            <div className="input-field col s3">
                                <input placeholder="Search on Title" id="title" type="text" className="validate" onLoadStart={this.props.filter} onChange={this.props.filter}></input>
                                <label htmlFor='title' className="active">Title of study or report</label>
                            </div>
                            <div className="input-field col s3">
                                <input placeholder="Search on Organization" id="org" type="text" className="validate" onChange={this.props.filter}></input>
                                <label htmlFor='org' className="active">Authoring organization</label>
                            </div>
                            <div className="input-field col s6">
                                <input placeholder="Search on Stat" id="stat" type="text" className="validate" onChange={this.props.filter}></input>
                                <label htmlFor='stat' className="active">Statistic</label>
                            </div>
                        </div>
                        <br></br>
                        <div className='row'>
                            <div className="input-field col s3">
                                <input placeholder='mm/dd/yyyy' id="beginDate" type="date" onChange={this.props.filter}></input>
                                <label htmlFor='beginDate' className="active">Published on or after</label>
                            </div>
                            <br></br>
                            <div className="input-field col s3">
                                <input placeholder='mm/dd/yyyy' id="endDate" type="date"  onChange={this.props.filter}></input>
                                <label htmlFor='endDate' className="active">Published on or before</label>
                            </div>
                            <div className="input-field col s6">
                                <input placeholder='Comma,separated,tags' id="topicTags" type="text" className="validate" onChange={this.props.filter}></input>
                                <label htmlFor='topicTags' data-error='wrong' className="active">Topic tags</label>
                            </div>
                        </div>
	                </div>
	                <div className="modal-footer">
	                    <a href="#!" className="modal-action modal-close waves-effect waves-light btn">Close</a>
	                    <a href="#!" onClick={this.props.filter} id='clearSearch' className="waves-effect waves-light btn clear-btn">Clear</a>
	                </div>
                </form>	                
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
            // Google Chrome's datepicker is picky about the format of the date passed to it
            var publishDate = '';
            if (data.published) {
                publishDate = new Date(data.published);
                var dd = publishDate.getDate();
                var mm = publishDate.getMonth() + 1; //January is 0!
                var yyyy = publishDate.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd
                }
                if (mm < 10) {
                    mm = '0' + mm
                }
                publishDate = yyyy + '-' + mm + '-' + dd;
            }

            this.setState({
                statsToAdd: [
                    {
                        title: data.title,
                        source: data.source,
                        org: data.org,
                        published: publishDate,
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

    submit: function(event) {
        event.preventDefault();
        $('a#Add, a#Edit').addClass('disabled');
        var RANGE;
        var action;

        var statsToAdd = this.state.statsToAdd;
        var values = [[]];

        // Format values and other headers properly based on whether we are adding a single stat, multiple, or editing
        // We are adding multiple stats
        if (this.state.buttonText == 'Add' && this.state.currStat > 0) {
            // If the user hits the '+' button to add another stat to the batch, but then leaves it blank, there is a trailing
            // empty element in statsToAdd. Here we remove it
            statsToAdd = statsToAdd.slice(0, this.state.currStat);
            for (var i = 0; i < this.state.currStat; i++) {
                statsToAdd[i]['lastTouch'] = window.currDate();
                values[i] = [
                    statsToAdd[i]["title"],
                    statsToAdd[i]["source"],
                    statsToAdd[i]["org"],
                    statsToAdd[i]["published"],
                    statsToAdd[i]['lastTouch'],
                    statsToAdd[i]["stat"],
                    statsToAdd[i]["topictags"],
                    (window.lastRow + i + 1)
                ];
            }
            RANGE = 'A' + window.lastRow + ':H' + (window.lastRow + statsToAdd.length);
            action = 'append';
        // We are editing or adding a single stat
        } else {
            statsToAdd[0]['lastTouch'] = window.currDate();
            values[0] = [
                    statsToAdd[0]["title"],
                    statsToAdd[0]["source"],
                    statsToAdd[0]["org"],
                    statsToAdd[0]["published"],
                    statsToAdd[0]['lastTouch'],
                    statsToAdd[0]["stat"],
                    statsToAdd[0]["topictags"],
            ];
            // New stats need a row number
            if (this.state.buttonText == 'Add' && this.state.currStat == 0) {
                RANGE = 'A' + (window.lastRow + 1) + ':H' + (window.lastRow + 1);
                action = 'append';
                values[0].push(window.lastRow + 1);
            // Existing stats use their existing row number
            } else {
                RANGE = 'A' + statsToAdd[0]["rowNum"] + ':H' + statsToAdd[0]["rowNum"];
                action = 'update';
                values[0].push(statsToAdd[0]["rowNum"]);
            }
        }

        gapi.client.sheets.spreadsheets.values[action]({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'USER_ENTERED',
            values: values
        // Success callback
        }).then(function(response) {
            if (this.state.buttonText == 'Add') {
                window.lastRow = window.lastRow + response.result.updates.updatedRows;
                this.props.insertStats(statsToAdd);
                Materialize.toast('Successfully added ' + response.result.updates.updatedRows + ' rows', 4000);
                $('a#Add, a#Edit').removeClass('disabled');
            } else {
                Materialize.toast('Successfully edited stat #' + statsToAdd[0].rowNum, 4000);
                $('a#Add, a#Edit').removeClass('disabled');
            }
            this.clear();
        // Error callback
        }.bind(this), function(response) {
            if (this.state.buttonText == 'Add') {
                Materialize.toast('Could not add ' + (this.state.currStat + 1) + ' rows', 4000);
            } else {
                Materialize.toast('Could not edit stat #' + statsToAdd[0].rowNum, 4000);
            }
            console.log('Error: ' + response.result.error.message);
            $('a#Add, a#Edit').removeClass('disabled');
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
        $('label').addClass('active');
    },

    //Handles user input when editing a stat
    handleChange:function(event){
/*        this.showTipIfInvalid(event.target.id, event.target.value);
*/
        var updatedArr = this.state.statsToAdd.slice();
        updatedArr[this.state.currStat][event.target.id] = event.target.value;
        this.setState({
            statsToAdd: updatedArr
        });
    },

    handleEnterKey:function(event) {
        if (event.key == 'Enter') {
            if (event.target.id == 'stat') {
                $('a#saveStatButton')[0].click();
            }
            if (event.target.id == 'topicTags') {
                $('a#Add, a#Edit')[0].click();
            }
        }
    },

    //For saving multiple stats for batch submission
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
        }
    },

    // renders the adding Stat form
    render: function() {
        return (
            <div id="addModal"  onSubmit={this.submit} className="modal bottom-sheet">
                <form id="addStatForm">
                    <div className="modal-header">
                        <AddStatHeader data={this.state} />
                    </div>
                    <div className="modal-content">
                            <div className='row'>
                                <div className="input-field col s3">
                                    <input value={this.state.statsToAdd[this.state.currStat]["title"]} onChange={this.handleChange} placeholder="Title of Report" id='title' type="text" className="validate" required></input>
                                    <label htmlFor='title' data-error='Invalid title' className="active">Title of study or report</label>
                                </div>
                                <div className="input-field col s3">
                                    <input value={this.state.statsToAdd[this.state.currStat]["source"]} onChange={this.handleChange} placeholder="http://www.example.com" id='source' type="url" className="validate" required></input>
                                    <label htmlFor='source' data-error='Invalid URL. Did you include "http://"?' className="active">Source URL</label>
                                </div>
                                <div className="input-field col s3">
                                    <input value={this.state.statsToAdd[this.state.currStat]["org"]} onChange={this.handleChange} placeholder="E.g. Ponemon, Verizon, etc." id='org' type="text" className="validate" required></input>
                                    <label htmlFor='org' data-error='Invalid organization' className="active">Authoring organization</label>
                                </div>
                                <div className="input-field col s3">
                                    <input value={this.state.statsToAdd[this.state.currStat]["published"]} onChange={this.handleChange} placeholder="mm/dd/yyyy" id='published' type="date" className="validate" ></input>
                                    <label htmlFor='published' data-error='Invalid date' className="active">Date published</label>
                                </div>
                            </div>
                            <div className='row'>
                                <div className="input-field col s6">
                                    <input value={this.state.statsToAdd[this.state.currStat]["topictags"]} onChange={this.handleChange} onKeyDown={this.handleEnterKey} placeholder="Comma,separated,tags" id='topicTags' type="text" className="validate" ></input>
                                    <label htmlFor='topicTags' data-error='Invalid tags' className="active">Topic tags</label>
                                </div>
                                <div className="input-field col s6">
                                    <textarea value={this.state.statsToAdd[this.state.currStat]["stat"]} onChange={this.handleChange} onKeyDown={this.handleEnterKey} placeholder="E.g. Two-thirds of respondents identified cyber risk as one of their top five concerns" id='stat' type="text" className="materialize-textarea validate" required></textarea>
                                    <label htmlFor='stat' data-error='Invalid statistic' className="active">Statistic</label>
                                </div>
                            </div>
                    </div>
                    <AddStatFooter buttonText={this.state.buttonText} clear={this.clear} submit={this.submit} saveStat={this.saveStat} source={this.state.statsToAdd.source}/>
                </form>
                <StatBatchPreviewModal statsToAdd={this.state.statsToAdd} currStat={this.currStat} />
            </div>
          )
      }
  });

var AddStatFooter = React.createClass({
    render: function() {
        if (this.props.buttonText == 'Add') {
            return (
                <div className="modal-footer">
                    <button type="submit" id={this.props.buttonText} onClick={this.props.submit} className="waves-effect btn">Submit</button>
                    <a href="#!" className="modal-action modal-close waves-effect btn">Close</a>
                    <a href="#!" onClick={this.props.clear} className="waves-effect btn">Clear</a>
                    <a href="#!" id="saveStatButton" onClick={this.props.saveStat} className="waves-effect btn">Add to batch</a>
                </div>
            );
        } else {
            return (
                <div className="modal-footer">
                    <button type="submit" id={this.props.buttonText} onClick={this.props.submit} className="waves-effect btn">Submit</button>
                    <a href="#!" className="modal-action modal-close waves-effect btn">Close</a>
                    <a href="#!" onClick={this.props.clear} className="waves-effect btn">Switch to Add Mode</a>
                </div>
            );
        }
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
