const { io } = require("socket.io");
import { DdongDataType, DdongType } from "./DdongDataType";
import {StartGameParamType, gameActionParamType, ChatParaType, GameResultParaType } from "./commonType";

let playerNo :string

//추가
const userId : HTMLDivElement = document.getElementById("userId") as HTMLDivElement | null
if(userId == null) alert("userID null")
const txtUserId : string = userId.textContent
const userNickname : HTMLDivElement = document.getElementById("userNickname") as HTMLDivElement | null
if(userNickname == null) alert("userNickname null") 
const txtUserNick : string = userNickname.textContent
//const strRoomName : string = userNickname.textContent  // 사용자가 두명이니 방이름은 이렇게 하면 안됨
// 추가 끝

// 방이름 정하기 -- html th:text 에서 들어옴
const strRoomName = document.getElementById("divRoomName").textContent



if( document.getElementById("divPlayerNo0") != null ){
    playerNo = document.getElementById("divPlayerNo0").textContent
} else {
    playerNo = document.getElementById("divPlayerNo1").textContent
}


const btnStart = document.getElementById("start")
// div  영역 설정 //
const ddongGameDiv : HTMLDivElement = document.getElementById("ddongGameBoard") as HTMLDivElement | null

const btnSendMessage = document.getElementById("btnSendMessage")
const txtChatMsg:HTMLInputElement  = <HTMLInputElement>document.getElementById("txtChatMsg")
const taChatMsg:HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("taChatMsg")
let gameData : DdongDataType = null

const Cons = {
    LEFT : 10,
    RIGHT : 410,
    TOP : 10,
    BOTTOM : 510,
    PADDLE_SIZE : 80,
    PLAYER_TOP : 480, // 30-50
}

// // *******화면을 현재 gameData로 update ******
const updateGameBoard = () :void  => {
    // 현재 있는 똥 그림을 지우고
    const imgsOld = ddongGameDiv.querySelectorAll('#ddongGameBoard img')
    for(let imgOld of imgsOld){
        ddongGameDiv.removeChild(imgOld.parentElement)
    }

    // 모든 똥 그림을 그림
    for(let xxx  of gameData.ddongs){
        const div : HTMLDivElement = document.createElement('div') as HTMLDivElement | null
        const img : HTMLImageElement = document.createElement('img') as HTMLImageElement | null
        img.src = "/image/ddong.png"; 
        img.alt = 'ddong'
        img.width = xxx.width
        img.height = xxx.height 
        // div.setAttribute("position", "absolute")
        // div.setAttribute("top", "" + xxx.top + "px" )
        // div.setAttribute("left", "" + xxx.left + "px" )
        // div.setAttribute("right", "" + (xxx.left + xxx.width) + "px")
        // div.setAttribute("bottom", ""+ (xxx.top+xxx.height)+"px")
        div.style.position = "absolute"
        div.style.left = "" + xxx.left + "px"
        div.style.top = "" + xxx.top + "px"
        div.style.width = "" + xxx.width + "px"
        div.style.height = "" + xxx.height + "px"
        div.appendChild(img)
        ddongGameDiv.appendChild(div);
    }
}

const sendChatMessage = (event) => {
    event.preventDefault();
    const param : ChatParaType = {
        rommName : strRoomName,
        nickname : txtUserNick,
        message : txtChatMsg.value
    }
    txtChatMsg.value = ""
    socket.emit('chatData', param)
}
btnSendMessage.addEventListener('click', sendChatMessage); 



// // ******* start button 클릭하면 server로 전송  ******
const onStartButtonClicked = (event) : void => {
    event.preventDefault()
    btnStart.setAttribute("disabled", "true")
    const param : StartGameParamType  = {
        roomName :strRoomName, 
        playerNo :playerNo
    }
    socket.emit('startGame', param)
}

btnStart.addEventListener('click', onStartButtonClicked)

const onBtnLeftClikced = (event) => {
    event.preventDefault()
    const data : gameActionParamType = {
        roomName : strRoomName,
        playerNo : playerNo, 
        action : 'btnLeftClicked'
    }
    socket.emit('gameData', data)
}

// ******* left button 관련 설정  ******
const btnLeft = document.getElementById("toLeft")
btnLeft.addEventListener('click', onBtnLeftClikced)

const onBtnRightClikced = (event) => {
    event.preventDefault()
    const data : gameActionParamType = {
        roomName : strRoomName,
        playerNo : playerNo, 
        action : 'btnRightClicked'
    }

    socket.emit('gameData', data)
}

// ******* Right button 관련 설정  ******
const btnRight = document.getElementById("toRight")
btnRight.addEventListener('click', onBtnRightClikced)

const onStopButtonClikced = (event) => {
    event.preventDefault()
    socket.emit('stopGame', playerNo, strRoomName)
}

// ******* Stop button 관련 설정  ******
const btnStop = document.getElementById("stopGame")
btnStop.addEventListener('click', onStopButtonClikced)



// ******* 게임 서버 접속  ******
const socket = io("http://localhost:3004/ddong", {path :"/socket.io"
});

const makeRoomCallBack = (result :string, strRoomName : string) => {
    console.log('makeRoomCallback 실행 : ', result)
    if(result === 'success') {
        alert( strRoomName + "방 생성 , 상대방을 기다립니다")
        //******* game start 준비 **************//
        //******* game start 준비 **************//
    } else {
        alert(strRoomName + "방 생성 실패입니다")
    }
}

const joinRoomCallBack = (result : string, strRoomName : string) : void => {
    console.log('joinRoomCallback 실행 : ', result)
    if(result === 'success') {
        alert(strRoomName + "방에 조인하였습니다")

        //******* game start 준비 **************//
        //******* game start 준비 **************//
    } else if(result ==='full') {
        alert(strRoomName + "방이 full입니다")
    } else {
        alert(strRoomName + "방 조인 실패입니다")
    }
}

// make room에서 왔으면
if(playerNo === 'player0'){
    // 이름의 방을 만든다
    socket.emit('ddong_create_room_from_gameroom', strRoomName, txtUserId, txtUserNick, (result : string) => {
        makeRoomCallBack(result, strRoomName )
    })
}

//join에서 왔으면 이름의 방에 join하고 server에서 prepareGame()
if(playerNo === 'player1'){
    socket.emit('ddong_join_room_from_gameroom', strRoomName, txtUserId, txtUserNick, (result : string) => {
        joinRoomCallBack(result, strRoomName)
    })
}
//
//
// // ******* 채팅 메시지 emit  ******
socket.on('chat message', function(msg:string) {
    taChatMsg.innerHTML = taChatMsg.innerHTML + msg + '&#10';
    console.log("chat message", msg);
});


socket.on('prepareForStart', function(msg : DdongDataType) {
    console.log("game data in prepareForStart", msg)
    gameData = msg  
    updateGameBoard()
    btnStart.removeAttribute('disabled')
});

socket.on('started', () => {
    btnStop.removeAttribute('disabled')
})

socket.on('stopped', (playerno:string) => {
    alert(playerno + " stooped Game 준비되면 Start Button을 누르세요")
    btnStart.removeAttribute('disabled')
    btnStop.setAttribute('disabled', 'true')
})

// // ******* 받은 gameData 처리 => 화면 updata  ******
socket.on('gameData', function(msg : DdongDataType) {
    console.log("game data", msg)
    gameData = msg
    updateGameBoard()
});

socket.on('winner', function(result : GameResultParaType) {

    if(playerNo === result.winner){
        const token : string  = document.querySelector('meta[name="_csrf"]').getAttribute("content").toString()
        const header : string = document.querySelector('meta[name="_csrf_header"]').getAttribute("content").toString()  
        // 성적 db에 올리기
        const sendData = {
            "game_kind" : "LADDER",
            "winner_id" : result.winnerId,
            "loser_id" : result.loserId
        }     
    
        fetch("http://localhost:8080/result/create", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              [header]: token,
            },
            body: JSON.stringify(sendData),   
        })
        .then((result) => {
            console.log(result)
            return result.text();
        })
        .then( (data) => {
            console.log(data)
        })
        .catch( (err) => {
            console.log(err)
        })
    
        confirm(" 승 리 " + "winner :" + result.winnerId + " loser :" + result.loserId)
    } 
    else{
        confirm(" 패 배 ")
    } 
    window.location.href="/ddong/waitingroom"
})
