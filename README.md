# ds-sheets
Front end for manipulating a Google Spreadsheet

## requirements
Register for a Client ID from the Google API Console  
Get the Sheet ID for a Google Spreadsheet to which you have read access

## setup
Create a text file named config.json in the root directory with the following contents:  
`{
  "client_id": "<YOUR-GOOGLE-SHEETS-CLIENT-ID-HERE>",
  "sheet_id": "<YOUR-GOOGLE-SHEET-ID-HERE>"
}`  

## usage
Run from a webserver such as simplehttpserver  
Log into Google with your credentials on index.html

## troubleshooting
If there are errors when granting access to your Google account, make sure you are running the webapp from a hostname whitelisted in your Google API Console.

