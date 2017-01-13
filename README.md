# DefenseStorm Stats Editor v0.9
Front end for manipulating a Google Spreadsheet of cybersecurity-related statistics, written in React.

## Requirements
### 1. Google Spreadsheet to which your Google account has read and write access  
  1. Create a Google Sheet
  2. Edit the __first row__ (A1:H1) as follows:
  
  |   | A     | B      | C   | D         | E         | F    | G         | H   |
  |---|-------|--------|-----|-----------|-----------|------|-----------|-----|
  | 1 | title | source | org | published | lastTouch | stat | topicTags | row |
  
  3. Select __View__ > __Freeze__ > __1 row__
  4. Select columns __D__ & __E__ simultaneously, then select __Format__ > __Number__ > __Date__
  5. Make note of the ID in the __address bar__:
  
  `https://docs.google.com/spreadsheets/d/<SPREADSHEET-ID-HERE>/edit`
  
### 2. OAuth client ID for a project with the Google Sheets API enabled
  1. Visit the [Google API Console](https://console.developers.google.com)
  2. Sign in to your Google account
  3. Enable the Google Sheets API (follow the prompts to create a project)
  4. Configure the OAuth consent screen
  5. Create an OAuth client ID for your project (__Credentials__ > __Create credentials__ > __OAuth client ID__ > __Web application__)
    1. Enter the URI that the application will be served from in __Authorized JavaScript origins__ and in __Authorized redirect URIs__

## Setup
1. Clone or download this repo
2. In your copy of the project, create a file called `config.json` in the root directory
3. Place the following contents in the file:
  `{
    "client_id"                 : "<YOUR-OAUTH-CLIENT-ID-HERE>",
    "sheet_id"                  : "<YOUR-SHEET-ID-HERE>",
    "scopes"                    : ["https://www.googleapis.com/auth/spreadsheets"],
    "max_rows"                  : "1000",
    "first_data_row"            : "2",
    "frequent_tag_threshold"    : "10"
  }`
  The `max_rows` property can be increased.
  The `frequent_tag_threshold` property is how many times a tag must appear in the Sheet backend before it appears above the StatTable for convenient filtering.
4. Run this web app from your preferred webserver
5. Navigate to the site from Chrome
6. Authenticate with your Google account

You are ready to filter, edit, and add stats.

## Troubleshooting
If there are errors when granting access to your Google account, make sure you are running the webapp from a hostname whitelisted in your Google API Console.

## Notes, caveats & known issues
* The architecture of this project makes it difficult/impossible to perform validation server-side. Any validation is therefore performed client-side. Please don't go forging POST requests :(
* Multiple users attempting to edit concurrently (via this app or Google Docs) will cause issues, including overwritten data, deletion of the incorrect row, etc.
* It is not advised to edit the Sheet directly
* When adding a stat, the local date at the client will be submitted to the "Date Added" column (column E in the Sheet)

