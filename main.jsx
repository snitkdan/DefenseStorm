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
	isBlank:function() {
		return(
			this.props.data.source === '' && this.props.data.title === '' &&
			this.props.data.stat === '' && this.props.data.topicTags === '' &&
			this.props.data.org === '' && this.props.data.published === '' && this.props.data.lastTouch === ''
		);
	},

    render: function() {
    	if (this.isBlank()) {
    		return null;
    	}
    	var published = (this.props.reformattedDate == null ? this.props.data.published : this.props.reformattedDate )
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
                <td>{published}</td>
                <td>{this.props.data.lastTouch}</td>
                <td>
                    <button data-target='addModal' className="modal-trigger btn-floating btn-small waves-effect waves-light" onClick={() => this.props.edit(this.props.data, this.props.arrayIndex)}>
                        <i className="material-icons">mode_edit</i>
                    </button>
                    <button className="btn-floating btn-small waves-effect waves-light" onClick={() => this.props.delete(this.props.data, this.props.arrayIndex)}>
                        <i className="material-icons">delete</i>
                    </button>
                </td>
            </tr>
        );
    }
});

var TagList = React.createClass({
	getInitialState:function(){
		if (this.props.topicTags) {
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
        if (newTopicTags) {
            this.setState({
                topicTags: newTopicTags.trim().split(',')
            });
        } else {
            this.setState({
                topicTags: []
            });
        }
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
                        {this.props.data.map((d, i) => <Stat edit={this.props.edit} delete={this.props.delete} key={i} arrayIndex={i} data={d}/>)}
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
    	var initFrequentTags = [];
    	for (var e = 0; e < this.props.tagCountsArray.length; e++) {
    		if (this.props.tagCountsArray[e][1] > window.frequent_tag_threshold) {
    			initFrequentTags.push(this.props.tagCountsArray[e][0]);
			}
    	}
        return ({
            searchCriteria			: {
                title		: '',
                org			: '',
                stat		: '',
                beginDate	: '',
                endDate		: '',
                topicTags	: ''
            },
            stats					: this.props.data,
            uniquePublishedYears	: this.props.uniquePublishedYears,
            tagCountsArray			: this.props.tagCountsArray,
            frequentTags			: initFrequentTags
        });
    },

    componentDidMount: function() {
        // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
        $('#searchModal, #addModal').modal({
            opacity: .1,
            ready: function(modal, trigger) {
                $('div.navbar-fixed').hide('fast');
            	$('body').addClass('scroll');
            	$('body').removeClass('noscroll');
            },
            complete: function() {
                $('div.navbar-fixed').show('fast');
            }
        });
        $('#statBatchPreviewModal').modal({
            opacity: .1,
            ready: function(modal, trigger) {
            	$('body').addClass('noscroll');
            	$('body').removeClass('scroll');
            	$('#statBatchPreviewModal').addClass('scroll');
            	$('#statBatchPreviewModal').removeClass('noscroll');
            },
            complete: function() {
            	$('body').addClass('scroll');
            	$('body').removeClass('noscroll');
            	$('#statBatchPreviewModal').addClass('noscroll');
            	$('#statBatchPreviewModal').removeClass('scroll');
            }
        });
    },

    quickSetTags:function(topicTags) {
        this.setState({
            searchCriteria: {
	            title: this.state.searchCriteria.title,
	            org: this.state.searchCriteria.org,
	            stat: this.state.searchCriteria.stat,
	            beginDate: this.state.searchCriteria.beginDate,
	            endDate: this.state.searchCriteria.endDate,
	            topicTags: topicTags
			}
        });
    },

    // Sets the searchTerm and searchCriterion to the event's value and id, respectively.
    // This determines what will be searched and what that search will be on.
    filter: function(event) {
        if ($(event.target).hasClass('quick-filter')) {
            if ($(event.target).hasClass('published-filterTag')) {
                var newBeginDate = $(event.target).attr('data') + '-01-01';
                var newEndDate = $(event.target).attr('data') + '-12-31';
                this.setState({
                    searchCriteria: {
                        title: this.state.searchCriteria.title,
                        org: this.state.searchCriteria.org,
                        stat: this.state.searchCriteria.stat,
                        beginDate: newBeginDate,
                        endDate: newEndDate,
                        topicTags: this.state.searchCriteria.topicTags
                    }
                });
            }
        } else if (event.target.id == 'topicTags' && event.target.value != '') {
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
        } else if ($(event.target).hasClass('clearSearch')) {
            if ($(event.target).hasClass('clearQuickFilters')) {
                var criterionToClear = $(event.target).attr('data-criterion');
                var newSearchCriteria = {};
                for (var criterion in this.state.searchCriteria) {
                	newSearchCriteria[criterion] = this.state.searchCriteria[criterion];
                }
                if (criterionToClear === 'published') {
                	newSearchCriteria['beginDate'] = '';
                	newSearchCriteria['endDate'] = '';
                } else {
                	newSearchCriteria[criterionToClear] = '';
            	}
                this.setState({
                    searchCriteria: newSearchCriteria
                });
	            $('.chip.quick-filter.' + criterionToClear + '-filterTag').removeClass('active');
            } else {
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
        		$('label').addClass('active');
	            $('.chip.quick-filter').removeClass('active');
	            $('#searchStatForm input:first-child').first().focus();
        	}
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

    // Set this.state.edit_data to the data parameter, the object representing a stat
    // Set this.state.editDataIndex to the index of the stat to be updated
    // This prompts <AddStat /> to re-render in 'Edit' mode rather than 'Add'
    edit: function(data, index) {
        $('#addStatForm').trigger('reset');
        $('form#addStatForm input').removeAttr('disabled');
        $('label').addClass('active');        
        this.setState({
        	edit_data: data,
        	editDataIndex: index
        });
    },

    clearEditData:function(event) {
    	if (this.state.edit_data != null) {
	    	this.setState({
	    		edit_data: null,
	    		editDataIndex: null
	    	});
        	$('#addStatForm').trigger('reset');
	        $('form#addStatForm input').removeAttr('disabled');
	        $('label').addClass('active');
	    }
    },

    // Update a stat in this.state.stats following a successful edit from <AddStat />
    // This prompts <StatTable /> to re-render, giving the appearance of real-time editing
    updateStat: function(newData) {
    	var updatedArr = [].concat(this.state.stats.slice());
    	updatedArr[this.state.editDataIndex] = newData;
    	this.setState({
    		stats: updatedArr
    	});
    },

    // Insert new stats into this.state.stats following a successful submit from <AddStat />
    // This prompts <StatTable /> to re-render, giving the appearance of real-time adding
    insertStats: function(newStats) {
        this.setState({
            stats: this.state.stats.concat(newStats)
        });
    },

    deleteStatLocally: function(index) {
    	this.setState({
    		stats: this.state.stats.slice(0, index).concat(this.state.stats.slice(index + 1))
    	});
    },

    updateUniquePublishedYears: function(yearArray) {
    	this.setState({
    		uniquePublishedYears: window.removeDuplicateElements(this.state.uniquePublishedYears.concat(yearArray).sort())
    	});
    },

    // Clear row in Google Sheet and return a Promise so we can hide the row on success */
    delete: function(data, index) {
        RANGE = 'A' + data.rowNum + ':H' + data.rowNum;
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
	            	'',
	            	''
            	]
            ]
        }).then(
        	// Success callback
            function(response) {
            	this.deleteStatLocally(index);
                Materialize.toast('Deleted stat. Title: ' + data.title, 4000);
            // Error callback
            }.bind(this), function(response) {
                Materialize.toast('Couldn\'t delete stat. Title: ' + data.title, 4000);
            }
        );

    },

    // renders the StatSearch component.
    render: function() {
        var stats = this.state.stats;
        for (var searchCriterion in this.state.searchCriteria) {
            var searchTerm = this.state.searchCriteria[searchCriterion];
            if (searchTerm.length > 0) {
                if (searchCriterion == 'beginDate') {
                    var beginElements = searchTerm.split("/");
                    var beginDate = new Date(searchTerm);
                    stats = stats.filter(function(stat) {
                        var statElements = stat['published'].split("/");
                        var date = new Date(stat['published']);
                        if (date >= beginDate)
                            return stat;
                        else
                            return null;
                        }
                    );
                } else if (searchCriterion == 'endDate') {
                    var endElements = searchTerm.split("/");
                    var endDate = new Date(searchTerm);
                    stats = stats.filter(function(stat) {
                        var statElements = stat['published'].split("/");
                        var date = new Date(stat['published']);
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
                                    <a id='add' data-target='addModal' className="modal-trigger" onClick={this.clearEditData}>
                                        <i className="black-text material-icons large">add</i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>                
                <AddStat edit_data={this.state.edit_data} insertStats={this.insertStats} updateStat={this.updateStat} updateUniquePublishedYears={this.updateUniquePublishedYears} clearEditData={this.clearEditData}/>
                <SearchStat filter={this.filter} activeFilters={this.state.searchCriteria} />
                <div id='statTable' className='col s12'>
                	<QuickFilterTagList filter={this.filter} data={this.state.uniquePublishedYears} criterion="published" />
					<QuickFilterTagList filter={this.filter} data={this.state.frequentTags} quickSetTags={this.quickSetTags} criterion="topicTags" />
                    <StatTable delete={this.delete} edit={this.edit} data={stats}/>
                </div>
            </div>
        );
    }
});

var QuickFilterTagList = React.createClass({
	getInitialState: function() {
		return({
			active: []
		});
	},

	setFilter: function(event) {
		if ($(event.target).hasClass('published-filterTag')) {
	        $('.published-filterTag').removeClass('active');
	        $(event.target).addClass('active');
	        this.props.filter(event);
		}
		if ($(event.target).hasClass('topicTags-filterTag')) {
			var newActive;
			if ($(event.target).hasClass('active')) {
				$(event.target).removeClass('active');
				newActive = [].concat(this.state.active);
				var index = newActive.indexOf($(event.target).attr('data'));
				while (index != -1) {
					newActive.splice(index, 1);
					index = newActive.indexOf($(event.target).attr('data'));
				}
				this.setState({
					active	:	newActive
				});
			} else {
				$(event.target).addClass('active');
				newActive = [$(event.target).attr('data')].concat(this.state.active);
				this.setState({
					active:	newActive
				});
			}
			this.props.quickSetTags(newActive);
		}
	},

    render: function() {
        return(
        	<div className='quickFilterTagList'>
        		<a href="#!" onClick={this.props.filter} className="waves-effect waves-light btn clearSearch clearQuickFilters" data-criterion={this.props.criterion}>Clear {this.props.criterion}</a>
        		{this.props.data.map((d, i) => <QuickFilterTag key={i} data={d} criterion={this.props.criterion} setFilter={this.setFilter} />)}
        	</div>
        );
    }
});

// Renders a list of clickable tags to make filtering easier
var QuickFilterTag = React.createClass({
    render: function() {
        return(
        	<div className={"chip quick-filter " + this.props.criterion + "-filterTag"} data={this.props.data} onClick={this.props.setFilter}>
        		{this.props.data}
        	</div>
        );
    }
});

//Contains the search functionality
var SearchStat = React.createClass({
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
                                <input value={this.props.activeFilters.title} placeholder="Search on Title" id="title" type="text" className="validate" onLoadStart={this.props.filter} onChange={this.props.filter}></input>
                                <label htmlFor='title' className="active">Title of study or report</label>
                            </div>
                            <div className="input-field col s3">
                                <input value={this.props.activeFilters.org} placeholder="Search on Organization" id="org" type="text" className="validate" onChange={this.props.filter}></input>
                                <label htmlFor='org' className="active">Authoring organization</label>
                            </div>
                            <div className="input-field col s6">
                                <input value={this.props.activeFilters.stat} placeholder="Search on Stat" id="stat" type="text" className="validate" onChange={this.props.filter}></input>
                                <label htmlFor='stat' className="active">Statistic</label>
                            </div>
                        </div>
                        <br></br>
                        <div className='row'>
                            <div className="input-field col s3">
                                <input value={this.props.activeFilters.beginDate} placeholder='mm/dd/yyyy' id="beginDate" type="date" onChange={this.props.filter}></input>
                                <label htmlFor='beginDate' className="active">Published on or after</label>
                            </div>
                            <br></br>
                            <div className="input-field col s3">
                                <input value={this.props.activeFilters.endDate} placeholder='mm/dd/yyyy' id="endDate" type="date"  onChange={this.props.filter}></input>
                                <label htmlFor='endDate' className="active">Published on or before</label>
                            </div>
                            <div className="input-field col s6">
                                <input value={this.props.activeFilters.topicTags} placeholder='Comma,separated,tags' id="topicTags" type="text" className="validate" onChange={this.props.filter}></input>
                                <label htmlFor='topicTags' data-error='Invalid tags' className="active">Topic tags</label>
                            </div>
                        </div>
	                </div>
	                <div className="modal-footer">
	                    <a href="#!" className="modal-action modal-close waves-effect waves-light btn">Close</a>
	                    <a href="#!" onClick={this.props.filter} className="waves-effect waves-light btn clearSearch">Clear</a>
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
                    rowNum:'',
                    lastTouch:''
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
                publishDate = window.getYYYYMMDDFromDateString(data.published);
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
                        rowNum:data.rowNum,
                        lastTouch:data.lastTouch
                    }
                ],
                buttonText:'Edit',
                currStat: 0
            });
        } else {
	        this.setState({
	            statsToAdd: [
	                {
	                    title:'',
	                    source:'',
	                    org:'',
	                    published:'',
	                    stat:'',
	                    topicTags:'',
	                    rowNum:'',
	                    lastTouch:''
	                }
	            ],
	            buttonText:'Add',
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
        var publishedYears = [];
        var allTagsToAdd = [];
        var values = [[]];

        // Format values and other headers properly based on whether we are adding a single stat, multiple, or editing
        // We are adding multiple stats
        if (this.state.buttonText == 'Add' && this.state.currStat > 0) {
            // If the user hits the '+' button to add another stat to the batch, but then leaves it blank, there is a trailing
            // empty element in statsToAdd. Here we remove it
            if (statsToAdd[this.state.currStat]["stat"] == '') {
            	statsToAdd = statsToAdd.slice(0, this.state.currStat);
        	}
            for (var i = 0; i <= this.state.currStat; i++) {
                statsToAdd[i]['lastTouch'] = window.currDate();
                statsToAdd[i]['topicTags'] = window.removeDuplicateTags(statsToAdd[i]['topicTags']);
		    	// Dates entered into the Google Sheet get formatted like so: MM/DD/YYYY with no leading zeroes
		    	// However, this piece of data hasn't made the round trip - it will be in the Chrome Datepicker's native format
		    	// which is YYYY-MM-DD
		    	// Using slashes instead of hyphens, we use Date() to parse the date in the local timezone for later display.
			    var publishDate = statsToAdd[i]["published"];    	
		    	if (publishDate != '') {
			    	var publishDateMMDDYYYY = window.getMMDDYYYYFromDateParts(window.getDateParts(new Date(publishDate.replace(/-/g, '/'))));
			    	statsToAdd[i]["published"] = publishDateMMDDYYYY;
		    	}
                values[i] = [
                    statsToAdd[i]["title"],
                    statsToAdd[i]["source"],
                    statsToAdd[i]["org"],
                    statsToAdd[i]["published"],
                    statsToAdd[i]['lastTouch'],
                    statsToAdd[i]["stat"],
                    statsToAdd[i]["topicTags"],
                    (window.LASTROW + i + 1)
                ];
                if (statsToAdd[i]["published"] != '') {
                    var publishedYear = statsToAdd[i]["published"].split('/')[2];
                    if (!publishedYears.includes(publishedYear)) {
                        publishedYears.push(publishedYear);
                    }
                }
            }
            RANGE = 'A' + window.LASTROW + ':H' + (window.LASTROW + statsToAdd.length);
            action = 'append';
        // We are editing or adding a single stat
        } else {
            statsToAdd[0]['lastTouch'] = window.currDate();
            statsToAdd[0]['topicTags'] = window.removeDuplicateTags(statsToAdd[0]['topicTags']);
            // If a stat is edited and the tags are left unchanged, this will end up incorrectly incrementing the count of each of those tags by one
            // until the page is reloaded, which is a bug I can live with
		    var publishDate = statsToAdd[0]["published"]; 	
	    	if (publishDate != '') {
		    	var publishDateMMDDYYYY = window.getMMDDYYYYFromDateParts(window.getDateParts(new Date(publishDate.replace(/-/g, '/'))));
		    	statsToAdd[0]["published"] = publishDateMMDDYYYY;
	    	}
            values[0] = [
                    statsToAdd[0]["title"],
                    statsToAdd[0]["source"],
                    statsToAdd[0]["org"],
                    statsToAdd[0]["published"],
                    statsToAdd[0]['lastTouch'],
                    statsToAdd[0]["stat"],
                    statsToAdd[0]["topicTags"],
            ];
            if (statsToAdd[0]["published"] != '') {
                var publishedYear = statsToAdd[0]["published"].split('/')[2];
                if (!publishedYears.includes(publishedYear)) {
                    publishedYears.push(publishedYear);
                }
            }
            // New stats need a row number
            if (this.state.buttonText == 'Add' && this.state.currStat == 0) {
                RANGE = 'A' + (window.LASTROW + 1) + ':H' + (window.LASTROW + 1);
                action = 'append';
                statsToAdd[0]["rowNum"] = window.LASTROW + 1;
            // Existing stats use their existing row number
            } else {
                RANGE = 'A' + statsToAdd[0]["rowNum"] + ':H' + statsToAdd[0]["rowNum"];
                action = 'update';
            }
            values[0].push(statsToAdd[0]["rowNum"]);
        }

        gapi.client.sheets.spreadsheets.values[action]({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'USER_ENTERED',
            values: values
        // Success callback
        }).then(function(response) {
            if (this.state.buttonText == 'Add') {
                window.LASTROW = window.LASTROW + response.result.updates.updatedRows;
                this.props.insertStats(statsToAdd);
                Materialize.toast('Successfully added ' + response.result.updates.updatedRows + ' stats', 4000);
            } else {
            	this.props.updateStat(statsToAdd[0]);
                Materialize.toast('Successfully edited stat. Title: ' + statsToAdd[0].title, 4000);
            }
            $('a#Add, a#Edit').removeClass('disabled');
            $('form#addStatForm input').removeAttr('disabled');
            this.clear();
            this.props.updateUniquePublishedYears(publishedYears);
        // Error callback
        }.bind(this), function(response) {
            if (this.state.buttonText == 'Add') {
                Materialize.toast('Could not add ' + (this.state.currStat + 1) + ' stats', 4000);
            } else {
                Materialize.toast('Could not edit stat. Title: ' + statsToAdd[0].title, 4000);
            }
            console.log('Error: ' + response.result.error.message);
            $('a#Add, a#Edit').removeClass('disabled');
            $('form#addStatForm input').removeAttr('disabled');
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
                        rowNum      :   '',
                        lastTouch	:	''
                    }
                ],
            buttonText  :   'Add',
            currStat    :   0
        });
		this.props.clearEditData();
        $('#addStatForm').trigger('reset');
        $('form#addStatForm input').removeAttr('disabled');
        $('label').addClass('active');
        $('#addStatForm input:first-child').first().focus();
    },

    //Handles user input when editing a stat
    handleChange:function(event){
    	// Make a deep copy of this.state.statsToAdd to avoid directly mutating state
        var updatedArr = [].concat(this.state.statsToAdd.slice());
        updatedArr[this.state.currStat][event.target.id] = event.target.value;
        this.setState({
            statsToAdd: updatedArr
        });
    },

    //For saving multiple stats for batch submission
    saveStat:function(event){
        if ($('#addStatForm')[0].checkValidity()) {
            var updatedArr = this.state.statsToAdd.slice();
            var nextStat = this.state.currStat + 1;
            updatedArr[nextStat] = {
                title       :   this.state.statsToAdd[this.state.currStat]['title'],
                source      :   this.state.statsToAdd[this.state.currStat]['source'],
                org         :   this.state.statsToAdd[this.state.currStat]['org'],
                published   :   this.state.statsToAdd[this.state.currStat]['published'],
                stat        :   '',
                topicTags   :   this.state.statsToAdd[this.state.currStat]['topicTags'],
                rowNum      :   '',
                lastTouch	:	''
            };
            this.setState({
                statsToAdd: updatedArr,
                currStat: nextStat
            });
            $('form#addStatForm input:not(#topicTags)').attr('disabled','disabled');
            $('#addStatForm textarea').focus();
        } else {
        	$('#addStatForm')[0].reportValidity();
        }
    },

    // renders the adding Stat form
    render: function() {
        return (
        	<div>
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
	                                    <input value={this.state.statsToAdd[this.state.currStat]["topicTags"]} onChange={this.handleChange} placeholder="Comma,separated,tags" id='topicTags' type="text" className="validate" ></input>
	                                    <label htmlFor='topicTags' data-error='Invalid tags' className="active">Topic tags</label>
	                                </div>
	                                <div className="input-field col s6">
	                                    <textarea value={this.state.statsToAdd[this.state.currStat]["stat"]} onChange={this.handleChange} placeholder="E.g. Two-thirds of respondents identified cyber risk as one of their top five concerns" id='stat' type="text" className="materialize-textarea validate" required></textarea>
	                                    <label htmlFor='stat' data-error='Invalid statistic' className="active">Statistic</label>
	                                </div>
	                            </div>
	                    </div>
	                    <AddStatFooter buttonText={this.state.buttonText} clear={this.clear} submit={this.submit} saveStat={this.saveStat} source={this.state.statsToAdd.source}/>
	                </form>
	            </div>
	            <StatBatchPreviewModal statsToAdd={this.state.statsToAdd} />
            </div>
          )
      }
  });

var AddStatFooter = React.createClass({
    render: function() {
        if (this.props.buttonText == 'Add') {
            return (
                <div className="modal-footer">
                    <button type="submit" id={this.props.buttonText} onSubmit={this.props.submit} className="waves-effect btn">Submit</button>
                    <a href="#!" className="modal-action modal-close waves-effect btn">Close</a>
                    <a href="#!" onClick={this.props.clear} className="waves-effect btn">Clear</a>
                    <a href="#!" id="saveStatButton" onClick={this.props.saveStat} className="waves-effect btn">Add to batch</a>
                </div>
            );
        } else {
            return (
                <div className="modal-footer">
                    <button type="submit" id={this.props.buttonText} onSubmit={this.props.submit} className="waves-effect btn">Submit</button>
                    <a href="#!" className="modal-action modal-close waves-effect btn">Close</a>
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
                    <table className='pure-table pure-table-bordered pure-table-striped' id="statBatchPreviewTable">
                        <thead>
                            <tr>
                                <th className='center-align'>Title</th>
                                <th className='center-align'>Stat</th>
                                <th className='center-align'>Organization</th>
                                <th className='center-align'>Date Published</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.statsToAdd.map((d, i) => <Stat edit={null} delete={null} key={'preview-' + i} arrayIndex={i} data={d} reformattedDate={window.getMMDDYYYYFromDateParts(d['published'].split('-'))}/>)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
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
var renderTable = function() {
  ReactDOM.render(<StatSearch data={test_data} uniquePublishedYears={window.quickFilterYears} tagCountsArray={window.tagCountsArray}/>, document.querySelector('#root'));
}
