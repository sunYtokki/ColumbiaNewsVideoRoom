<p> The JavaScript files in the repository are written with Google Apps Script API and YouTube Data API in order to aumatically scrap YouTube video metadata and store the data in Google Spread Sheet for data mining project.</p>

<h2>importVideoData.js</h2>
<p>The script imports list of uploaded video of a Youtube channel during the degignaed period of time 
and writes the data into an active spreadsheet.</p>

1. Add Youtube username as the sheet name that you want to write the data.
![](images/Username.png)
2. Creat a new script at **Tool->Script Editor** and paste the script code.
3. Activate Youtube Data API at **Resources->Advanced Google services**
![](images/youtubedataApi.png)
4. Run the script

![](images/UploadedVideoSS.png)
<a href="https://docs.google.com/spreadsheets/d/1G987QElFnEt3IbYIj_c3mqp-Bm9JrMBhw39osV0fqEQ/edit?usp=sharing">Link to sample spredsheet</a>
<hr>

<h2>newVideoDetector.js</h2>
<p>The script find there is a newly updated video in a YouTube Channel and write the metadata of video in an active spread sheet.

