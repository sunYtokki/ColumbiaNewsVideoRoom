function YTAPINewVideoDetetor() {
  //connect with Google sheet
  var ss = SpreadsheetApp.openById("1mAXAT1z4mtZCjh1PMDWz84vO0xnuLmAsbCjedi9Tllk")
  var as = ss.getSheetByName("YouTube")
  var nextPage = ''  
  
  //get the latest row information
  var lastRow = as.getLastRow()
  
  //sort the sheet by date and get neccessray information for comparison
  as.sort(2, true)
  var lastUpload = new Date(as.getRange(lastRow, 2).getValue())
  var videoIDs=as.getRange("J2:J"+lastRow).getValues()

  while(nextPage != null){
    //request data to YouTube API recently uploaded video
    var uploads = YouTube.Activities.list("contentDetails",{channelId: "UChzhFUxUZFAQSJZ_Tp4B1fA", 
                                                            publishedAfter: lastUpod.toISOString(),
                                                            maxResults: 1,
                                                            pageToken: nextPage})
    
    //Filter other activities (eg.playlistItem) and store information about new video 
    var videos = uploads.items.map(function(elem){
      return (elem.contentDetails.upload == null) ? null : elem.contentDetails.upload.videoId })
    videos = videos.filter(Boolean);
    
    videos.forEach(function(video){
      var videoData = YouTube.Videos.list("contentDetails,statistics,snippet", {id: video}).items[0]
      var result = [videoData.snippet.title,
                    new Date(videoData.snippet.publishedAt),
                    durationFormatter(videoData.contentDetails.duration),
                    '','','','',
                    videoData.statistics.viewCount,
                    "https://www.youtube.com/watch?v="+video,
                    video]
        
      //make sure the data doesn't exist in the sheet and print out the data to the sheet
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
  var ss = SpreadsheetApp.openById("1mAXAT1z4mtZCjh1PMDWz84vO0xnuLmAsbCjedi9Tllk")
  var as = ss.getSheetByName("YouTube")

  var data = as.getDataRange().getValues()
  
  //update to current view
  for(var row=1; row < as.getLastRow(); row++){
    var videoID = data[row][9]
    var newViewCount = YouTube.Videos.list("statistics", {id: videoID}).items[0].statistics.viewCount
    
    //set the current view 'current view' col
    as.getRange(row+1,8,1,1).setValue(newViewCount)
  }  
  
  for(var i=1; i<=data.length-1; i++){

    var postedDate = new Date(data[i][1])
    var today = new Date()
    var daysPast = Math.floor((today.getTime() - postedDate.getTime()) / (1000*60*60*24))   
    var currentView = data[i][7]
    
    Logger.log(daysPast)
    
    if(daysPast==2){
      as.getRange(i+1,4).setValue(currentView)
    } 
    else if(daysPast==7){
      as.getRange(i+1,5).setValue(currentView)
    }
    else if(daysPast==14){
      as.getRange(i+1,6).setValue(currentView)
    }
    else if(daysPast==31){
      as.getRange(i+1,7).setValue(currentView)
    }
    else if(daysPast>31){
      as.getRange(i+1,1).setBackgroundRGB(172,211,160)
    }
    /*
    else if(daysPast>31 && !as.getRange(i+1,7).isBlank()){
      //transfer data to permanant sheet
      as.deleteRow(i+1)
    }*/
  }
} 
