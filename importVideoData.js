function importUploadVideos {
  //import active spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var as = ss.getActiveSheet()
  var nextPage = ''
 
  //get tab name to resolve channelID
  var userName = as.getName()
  var channelID = YouTube.Channels.list("id",{forUsername: userName}).items[0].id
    
  //set date range
  var startDate = "2019-01-01T00:00:00.000Z"
  var endDate = "2020-01-01T00:00:00.000Z"
  var maxResults = 50 //YouTube set 50 as maximum per request 

  //get video list and metadata in the date rage
  //each iteration retrives upto maxResults videos' information 
  while(nextPage != null){
    var uploads = YouTube.Activities.list("contentDetails",{channelId: channelID, 
                                                            publishedAfter:startDate,
                                                            publishedBefore:endDate,
                                                            maxResults: maxResults,
                                                            pageToken: nextPae})
    
    //Filter out activities other than new video uploads eg.add a new playlist to the channel
    var videos = uploads.items.map(function(elem){
      return (elem.contentDetails.upload == null) ? null : elem.contentDetails.upload.videoId })
    videos = videos.filter(Boolean);
        
    //store metadatas of each video in an array
    videos.forEach(function(video){
      var videoData = YouTube.Videos.list("contentDetails,statistics,snippet", {id: video}).items[0]
      var result = [new Date(videoData.snippet.publishedAt),
                    durationFormatter(videoData.contentDetails.duration),
                    videoData.statistics.viewCount,
                    videoData.statistics.likeCount,
                    videoData.statistics.commentCount]

      //print out the array to the active sheet
      //title is written with hyperlink info so that user can see the video by clicking title
      var row = as.getLastRow()+1
      as.getRange(row,1,1,1).setFormula( '=HYPERLINK( "http://www.youtube.com/watch?v=' + 
                                         video + '","' + videoData.snippet.title + '") ')
      as.getRange(row,2,1,result.length).setValues([result])
      
    })
    
    //upload page token
    nextPage = uploads.nextPageToken
 }
  
  //helper function to resolve ISO_8601 duration format to hh:mm:ss
  function durationFormatter(duration){
    var str = duration.substring(2).replace(/[H]|[M]+/g,":").replace(/S/,"")    
    str = ((str.charAt(str.length-1) == ":") ? str + "00" : (str.length <= 2) ? "0:" + str : str).split(":")     
    while(str.length <= 2){str.unshift("0")}
    return str.join(":")     
  }
}

