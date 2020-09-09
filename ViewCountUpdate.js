function ViewCountUpdate() {
//connect with Google sheet
  var ss = SpreadsheetApp.openById("1ImbE-cf643GGUP16o3RXkFMjIwMdj7ESvLWMKUHPqdA")
  var as = ss.getSheetByName("Youtube") 
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
