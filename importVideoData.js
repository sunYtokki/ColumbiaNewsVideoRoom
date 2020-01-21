function importUploadVideos_ver3() {

    //connect with Google sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet()
	var as = ss.getActiveSheet()
	
	var nextPage = '' //next page token
	
	//get channelID from the youtube username which is available public unlike channelID
	//userName is passed as the activeSheet name
    var userName = as.getName() 
    var channelID = YouTube.Channels.list("id",{forUsername: userName}).items[0].id
	  
	//read upload information from the channel activity list
	//each iteration retrives upto 50 uploads information
    while(nextPage != null){
      
      var uploads = YouTube.Activities.list("contentDetails",{channelId: channelID, 
                                                              publishedAfter:"2019-01-01T00:00:00.000Z",
                                                              publishedBefore:"2020-01-01T00:00:00.000Z",
                                                              maxResults: 50,
                                                              pageToken: nextPage})
      
      //Filter other activities besides uploads (eg.playlistItem)
      var videos = uploads.items.map(function(elem){
        return (elem.contentDetails.upload == null) ? null : elem.contentDetails.upload.videoId })          
      videos = videos.filter(Boolean); //delete null cells
          
	  //get statistics of each video
      videos.forEach(function(video){
        var videoData = YouTube.Videos.list("contentDetails,statistics,snippet", {id: video}).items[0]
        var result = [new Date(videoData.snippet.publishedAt),
                      durationFormatter(videoData.contentDetails.duration),
                      videoData.statistics.viewCount,
                      videoData.statistics.likeCount,
                      videoData.statistics.commentCount]
  
        //print out the data to the active sheet
        var row = as.getLastRow()+1
        as.getRange(row,1,1,1).setFormula( '=HYPERLINK( "http://www.youtube.com/watch?v=' + 
											video + '","' + videoData.snippet.title + '") ')
        as.getRange(row,2,1,result.length).setValues([result])
        
      })
      
      nextPage = uploads.nextPageToken //update page token 
   }
	
	//convert ISO_8601 format to hh:mm:ss
    function durationFormatter(duration){
      var str = duration.substring(2).replace(/[H]|[M]+/g,":").replace(/S/,"")    
      str = ((str.charAt(str.length-1) == ":") ? str + "00" : (str.length <= 2) ? "0:" + str : str).split(":")     
      while(str.length <= 2){str.unshift("0")}
      return str.join(":")     
    }
      
  }
  
  
  
  