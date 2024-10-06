const express=require("express"); //nodejs server library
//socket.io : websocket -> FAST Request / Response
const socketIo=require("socket.io"); //websocket -> http websocket 
const http=require("http");
const path=require("path");

const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: "YOUR_OPENAI_KEY",  
});

// 사용자 정보 저장을 위한 Object
const userLanguageInfo={};
const languageList = [];

const app=express();
app.use(express.static(path.join(__dirname,"src")));
const server = http.createServer(app);

//websocket message data get and emit all
const io=socketIo(server);
io.on("connection",function(socket){
    console.log("somebody connected our server!!");
    console.log("FROM IP :"+socket.handshake.address);

    //Add userLanguageInfo -uniqueSocketId : Default Language  
    userLanguageInfo[socket.id] = "english"; //Add
    //if language is NOT in languageList -> ADD to languageList
    //if language is in languageList -> DO Nothing
    if (languageList.includes("english")==false) {
        languageList.push("english"); // 값이 리스트에 없으면 추가
    }

    //receive emitted message
    socket.on("chatMessage", async function(data){
      console.log("Received Data: " +data);
      //data.ID / data.Message / data.ProfileNum 

      //language array List
      //1. translate language only in language list 
      //2. save translated result in somewhere
      // transResultList["english"] = "hello";
      // transResultList["korean"] = "안녕";
      //3. send to user translated result

      
      //for : scan all object in array 
      //languageList = [ 'english', 'Korean', 'Japanese' ]
      // transResultList["english"] = "hello";
      // transResultList["korean"] = "안녕";
      const transResultList = {};
      for(const tempLanguage of languageList){
        try {
          //1. translate language!! (first in englsh)
          transResultList[tempLanguage]= await gptTranslate(data.Message, tempLanguage);
        } 
        catch (error) {
          console.error("Error translating message:", error);
            transResultList[tempLanguage]= "[Translation Failed]: " + data.Message;
        }
      }

      //userLanguageInfo["jbsong"] = "korean";
      //userLanguageInfo["danwoo"] = "english";
      for (const socketID in userLanguageInfo) //for.. in : list의 index를 scan
      {    
          let transResult = transResultList[userLanguageInfo[socketID]];
          
          //2. regenerate newData object
          const newData = {ID:data.ID, Message:transResult, ProfileNum:data.ProfileNum}

          //3.Emit to socketID Only
          io.to(socketID).emit("chatMessage", newData);
      }
    });

    //receive change Language
    socket.on("changeLanguage", function(language){
      //fuction for change language
      userLanguageInfo[socket.id] = language; //Update

      //update language List
      if (languageList.includes(language)==false) {
          languageList.push(language); // 값이 리스트에 없으면 추가
          console.log(languageList);
      }      
    });
  }
);

//funtion : translate language using gptAPI
async function gptTranslate(message, language){

  let translatedMessage="";

  try {
    const prompt = "translate "+ message+" to " + language +" and give me only translated result. No pronunciation";
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', //"gpt-4o" //"gpt-4o-mini"
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    translatedMessage = response.choices[0].message.content.trim();
    
    console.log('Response:', translatedMessage);
    return translatedMessage;
  } 
  catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return "translated error";
  }
}


//Server (server_address :192.168.137.102 (=naver.com) / PORT = 3000)
const PORT = 3000;
server.listen(PORT, function(){
    console.log("Server is running on port "+PORT);
  }        
);

//default response
app.get("/", (req,res)=> {
  res.send("welcome to chatting Server");
});
