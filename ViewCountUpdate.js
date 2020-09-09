/*
The script reads Youtube URL and convert it to YouTube video ID then
requests statistic data to YouTube Data API to update current view count
The script is compatible with Google Spread Sheet.
*/

function ViewCountUpdate() {
//connect with Google sheet
  var ss = SpreadsheetApp.openById("<SS ID>")
  var as = ss.getSheetByName("<active SS name>") 
  var lastRow = as.getLastRow()
  var nextPage = ''  
  //var videoIDs=as.getRange("J2:J"+lastRow).getValues()
  var videoUrls=as.getRange("I2:I"+lastRow).getValues()
  
  var videoIDs = []
  videoUrls.forEach( videoUrl => {
                    videoIDs.push(YouTubeGetID(videoUrl[0]))
                    })
  console.log(videoIDs)
  
  //import viewcount from the YouTube API
  var views = []  
  videoIDs.forEach( videoID => {
                      var stat = YouTube.Videos.list("statistics", {id: videoID}).items[0]
                      if (stat) {
                       views.push(stat.statistics.viewCount)
                      }
                      else{
                        views.push("deleted")
                      }
                   })
   console.log(views)
   console.log(views.length)
                   
   // write the datat to the SS               
   for (i=0; i<=views.length; i++){
       as.getRange(i+2, 8, 1, 1).setValue(views[i])
   }

  // The original code of this function is from https://gist.github.com/takien/4077195
  function YouTubeGetID(url){
    var ID = '';
    url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if(url[2] !== undefined) {
      ID = url[2].split(/[^0-9a-z_\-]/i);
      ID = ID[0];
    }
    else {
      ID = url;
    }
      return ID;
  }

}
