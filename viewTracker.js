function dataWriter() {
  
    var ss = SpreadsheetApp.openById("1mAXAT1z4mtZCjh1PMDWz84vO0xnuLmAsbCjedi9Tllk")
    var as = ss.getSheetByName("YouTube")
  
    var data = as.getDataRange().getValues()
    
    //update to current view
    for(var row=1; row < as.getLastRow(); row++){
      var videoID = data[row][9]
      var newViewCount = YouTube.Videos.list("statistics", {id: videoID}).items[0].statistics.viewCount
      
  //    Logger.log(newViewCount)
      as.getRange(row+1,7,1,1).clearContent()
      as.getRange(row+1,8,1,1).setValue(newViewCount)
      
    }    
    
    
    for(var i=1; i<data.length; i++){
        
      var postedDate = new Date(data[i][1])
      var today = new Date()
      var daysPast = Math.floor((today.getTime() - postedDate.getTime()) / (1000*60*60*24))
      
      //Logger.log(postedDate)
      //Logger.log(today)
      Logger.log(daysPast)
          
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
  
  