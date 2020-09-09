function YTAPINewVideoDetector() {
  //connect with Google sheet
  var ss = SpreadsheetApp.openById("your spreadsheet ID")
  var as = ss.getSheetByName("your active sheet name")
  var nextPage = ''  
  
  //get the latest row information
  var lastRow = as.getLastRow()
  
  //get the latest upload date on the sheet
  as.sort(2, true)
  var lastUpload = new Date(as.getRange(lastRow, 2).getValue())
  var videoIDs=as.getRange("J2:J"+lastRow).getValues()

  while(nextPage != null){
    //request data to YouTube API recently uploaded video since the last time script excuted
    var uploads = YouTube.Activities.list("contentDetails",{channelId: "UChzhFUxUZFAQSJZ_Tp4B1fA", 
                                                            publishedAfter: lastUpload.toISOString(),
                                                            maxResults: 1,
                                                            pageToken: nextPage})
    
    //Filter other activities (eg.playlistItem) and store information about new video 
    var videos = uploads.items.map( elem => {
      return (elem.contentDetails.upload == null) ? null : elem.contentDetails.upload.videoId })
    videos = videos.filter(Boolean);
    
    videos.forEach( video => {
      var videoData = YouTube.Videos.list("contentDetails,statistics,snippet", {id: video}).items[0]
      var result = [videoData.snippet.title,
                    new Date(videoData.snippet.publishedAt),
                    durationFormatter(videoData.contentDetails.duration),
                    '','','','',
                    videoData.statistics.viewCount,
                    "https://www.youtube.com/watch?v="+video,
                    video]

      console.log(result)
      console.log("converted duration: ", durationFormatter(videoData.contentDetails.duration))
      
      //Handle duplicate and print out the data to the sheet
      if(result[1].getTime() != lastUpload.getTime() && 
         !videoIDs.hasOwnProperty(result[6])){        
        as.getRange(as.getLastRow()+1,1,1,result.length).setValues([result])
      }
    })
    nextPage = uploads.nextPageToken
 }
  
  function durationFormatter(duration){
    var str = duration.substring(2).replace(/[H]|[M]+/g,":").replace(/S/,"")    
    str = ((str.charAt(str.length-1) == ":") ? str + "00" : (str.length <= 2) ? "0:" + str : str).split(":")     
    while(str.length <= 2){str.unshift("0")}
    return str.join(":")     
  }
}



function dataWriter() {
  var ss = SpreadsheetApp.openById("your spreadsheet ID")
  var as = ss.getSheetByName("your active sheet name")

  var data = as.getDataRange().getValues()
  
  for(let row=1; row < as.getLastRow(); row++){
    var videoID = data[row][9]
    
    //update view count 
    var videoList = YouTube.Videos.list("statistics", {id: videoID}).items[0]
    var viewCount = videoList == undefined ? "err" : videoList.statistics.viewCount       
    as.getRange(row+1,8,1,1).setValue(viewCount)
    
    //caculate how many days past since posting
    var postedDate = new Date(data[row][1])
    var today = new Date()
    var daysPast = Math.floor((today.getTime() - postedDate.getTime()) / (1000*60*60*24))    
    var currentView = data[row][7]

    //update sheet
    if(daysPast==2){
      as.getRange(row+1,3).setValue(currentView)
    } 
    else if(daysPast==7){
      as.getRange(row+1,4).setValue(currentView)
    }
    else if(daysPast==14){
      as.getRange(row+1,5).setValue(currentView)
    }
    else if(daysPast==31){
      as.getRange(row+1,6).setValue(currentView)
    }
    else if(daysPast>31){
      //mark row ready for archiving
      as.getRange(row+1,1).setBackgroundRGB(172,211,160)
    }
  } 
}

