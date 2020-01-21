/**
 * 
 * 
 */

function YTAPINewVideoDetetor() {

    //connect with Google sheet
    var ss = SpreadsheetApp.openById("1mAXAT1z4mtZCjh1PMDWz84vO0xnuLmAsbCjedi9Tllk")
    var as = ss.getSheetByName("YouTube")
    var nextPage = ''
    //var userName = as.getName()
    //var channelID = YouTube.Channels.list("id",{forUsername: "columbiauniversity"}).items[0].id
    var lastUpload = new Date(as.getRange(as.getLastRow(), 2).getValue())
  
    
    while(nextPage != null){
      
        var uploads = YouTube.Activities.list("contentDetails",{channelId: "UChzhFUxUZFAQSJZ_Tp4B1fA", 
                                                                publishedAfter: lastUpload.toISOString(),
                                                                maxResults: 1,
                                                                pageToken: nextPage})
        
        //Filter other activities other than uploads eg.playlistItem
        var videos = uploads.items.map(function(elem){
            return (elem.contentDetails.upload == null) ? null : elem.contentDetails.upload.videoId })
            
        //cleanup the null cell. 
        videos = videos.filter(Boolean);
            
        //
        videos.forEach(function(video){
            var videoData = YouTube.Videos.list("contentDetails,statistics,snippet", {id: video}).items[0]
            var result = [videoData.snippet.title,
                        new Date(videoData.snippet.publishedAt),
                        durationFormatter(videoData.contentDetails.duration),
                        '','','','',
                        videoData.statistics.viewCount,
                        "https://www.youtube.com/watch?v="+video,
                        video]          

            //print out the data to the sheet        
            if(result[1].getTime() != lastUpload.getTime()){
                as.getRange(as.getLastRow()+1,1,1,result.length).setValues([result])}
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
  
    var ss = SpreadsheetApp.openById("SheetID")
    var as = ss.getSheetByName("YouTube")
  
    var data = as.getDataRange().getValues()
    
    //update viewData to current view for each video 
    for(var row=1; row < as.getLastRow(); row++){
        // pull the data from YouTube API
        var videoID = data[row][9]
        var newViewCount = YouTube.Videos.list("statistics", {id: videoID}).items[0].statistics.viewCount

        // write the data on the sheet
        as.getRange(row+1,7,1,1).clearContent()
        as.getRange(row+1,8,1,1).setValue(newViewCount)      
    }    
    
    
    //count days past since posting 
    for(var i=1; i<data.length; i++){
        
        var postedDate = new Date(data[i][1])
        var today = new Date()
        var daysPast = Math.floor((today.getTime() - postedDate.getTime()) / (1000*60*60*24)) 
        var currentView = data[i][7]
        
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
    }
}
  
  