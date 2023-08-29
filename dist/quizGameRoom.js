const { io } = require("socket.io");
let playerNo;
//추가
const userId = document.getElementById("userId");
if (userId == null)
    alert("userID null");
const txtUserId = userId.textContent;
const userNickname = document.getElementById("userNickname");
if (userNickname == null)
    alert("userNickname null");
const txtUserNick = userNickname.textContent;
//const strRoomName : string = userNickname.textContent  // 사용자가 두명이니 방이름은 이렇게 하면 안됨
// 추가 끝
// 방이름 정하기 -- html th:text 에서 들어옴
const strRoomName = document.getElementById("divRoomName").textContent;
if (document.getElementById("divPlayerNo0") != null) {
    playerNo = document.getElementById("divPlayerNo0").textContent;
}
else {
    playerNo = document.getElementById("divPlayerNo1").textContent;
}
const btnStart = document.getElementById("start");
const btnSendMessage = document.getElementById("btnSendMessage");
const txtChatMsg = document.getElementById("txtChatMsg");
const taChatMsg = document.getElementById("taChatMsg");
let gameData = null;
// timber 문제 및 답안 영역 설정
const divTimer = document.getElementById("divTimer");
const divProblem = document.getElementById("divProblem");
const divAnswer1 = document.getElementById("divAnswer1");
const divAnswer2 = document.getElementById("divAnswer2");
const divAnswer3 = document.getElementById("divAnswer3");
const divAnswer4 = document.getElementById("divAnswer4");
const divAreas = document.querySelectorAll("#quizArea > div");
const Cons = {};
const updateDivArea = () => {
    for (let i = 0; i < 4; i++)
        divAreas[i + 2].style.backgroundColor = '#eeeeee';
    switch (gameData.player0_selected) {
        case 1:
            divAnswer1.style.backgroundColor = '#FFA500';
            break;
        case 2:
            divAnswer2.style.backgroundColor = '#FFA500';
            break;
        case 3:
            divAnswer3.style.backgroundColor = '#FFA500';
            break;
        case 4:
            divAnswer4.style.backgroundColor = '#FFA500';
            break;
    }
    switch (gameData.player1_selected) {
        case 1:
            divAnswer1.style.backgroundColor = '#87CEEB';
            break;
        case 2:
            divAnswer2.style.backgroundColor = '#87CEEB';
            break;
        case 3:
            divAnswer3.style.backgroundColor = '#87CEEB';
            break;
        case 4:
            divAnswer4.style.backgroundColor = '#87CEEB';
            break;
    }
};
// // *******화면을 현재 gameData로 update ******
const updateGameBoard = () => {
    updateDivArea();
    divTimer.innerText = gameData.timeRemain.toString();
};
const onDivAnswerClickced = (event) => {
    event.preventDefault();
    if (gameData.timer == null)
        return;
    let selected = -1;
    switch (event.target) {
        case divAnswer1:
            selected = 1;
            break;
        case divAnswer2:
            selected = 2;
            break;
        case divAnswer3:
            selected = 3;
            break;
        case divAnswer4:
            selected = 4;
            break;
    }
    console.log("selected : " + selected);
    const param = {
        roomName: strRoomName,
        playerNo: playerNo,
        clickedDivision: selected
    };
    socket.emit('answer_selected', param);
};
divAnswer1.addEventListener('click', onDivAnswerClickced);
divAnswer2.addEventListener('click', onDivAnswerClickced);
divAnswer3.addEventListener('click', onDivAnswerClickced);
divAnswer4.addEventListener('click', onDivAnswerClickced);
const sendChatMessage = (event) => {
    event.preventDefault();
    const param = {
        rommName: strRoomName,
        nickname: txtUserNick,
        message: txtChatMsg.value
    };
    txtChatMsg.value = "";
    socket.emit('chatData', param);
};
btnSendMessage.addEventListener('click', sendChatMessage);
// // ******* start button 클릭하면 server로 전송  ******
const onStartButtonClicked = (event) => {
    event.preventDefault();
    btnStart.setAttribute("disabled", "true");
    const param = {
        roomName: strRoomName,
        playerNo: playerNo
    };
    socket.emit('startGame', param);
};
btnStart.addEventListener('click', onStartButtonClicked);
// ******* 게임 서버 접속  ******
const socket = io("http://localhost:3002/quiz", { path: "/socket.io"
});
const makeRoomCallBack = (result, strRoomName) => {
    console.log('makeRoomCallback 실행 : ', result);
    if (result === 'success') {
        alert(strRoomName + "방 생성 , 상대방을 기다립니다");
        //******* game start 준비 **************//
        //******* game start 준비 **************//
    }
    else {
        alert(strRoomName + "방 생성 실패입니다");
    }
};
const joinRoomCallBack = (result, strRoomName) => {
    console.log('joinRoomCallback 실행 : ', result);
    if (result === 'success') {
        alert(strRoomName + "방에 조인하였습니다");
        //******* game start 준비 **************//
        //******* game start 준비 **************//
    }
    else if (result === 'full') {
        alert(strRoomName + "방이 full입니다");
    }
    else {
        alert(strRoomName + "방 조인 실패입니다");
    }
};
// make room에서 왔으면
if (playerNo === 'player0') {
    // 이름의 방을 만든다
    socket.emit('quiz_create_room_from_gameroom', strRoomName, txtUserId, txtUserNick, (result) => {
        makeRoomCallBack(result, strRoomName);
    });
}
//join에서 왔으면 이름의 방에 join하고 server에서 prepareGame()
if (playerNo === 'player1') {
    socket.emit('quiz_join_room_from_gameroom', strRoomName, txtUserId, txtUserNick, (result) => {
        joinRoomCallBack(result, strRoomName);
    });
}
//
//
// // ******* 채팅 메시지 emit  ******
socket.on('chat message', function (msg) {
    taChatMsg.innerHTML = taChatMsg.innerHTML + msg + '&#10';
    console.log("chat message", msg);
});
socket.on('prepareForStart', function (msg) {
    console.log("game data in prepareForStart", msg);
    gameData = msg;
    updateGameBoard();
    btnStart.removeAttribute('disabled');
});
// // ******* 받은 gameData 처리 => 화면 updata  ******
socket.on('gameData', function (msg) {
    console.log("game data", msg);
    gameData = msg;
    console.log(gameData.problem, console.log(divProblem));
    if (gameData.problem != null && divProblem.innerText == "문제영역")
        updateQuizArea();
    updateGameBoard(); // timer만
});
const updateQuizArea = () => {
    divProblem.innerText = gameData.problem;
    divAnswer1.innerText = gameData.select1;
    divAnswer2.innerText = gameData.select2;
    divAnswer3.innerText = gameData.select3;
    divAnswer4.innerText = gameData.select4;
};
socket.on('div_selected_data', function (msg) {
    console.log("game data", msg);
    gameData = msg; // 받은 gameData로 현재 gameData update후 새로 그려줌
    updateDivArea();
});
socket.on('winner', function (result) {
    gameData.timer = null;
    if (playerNo === result.winner) {
        const token = document.querySelector('meta[name="_csrf"]').getAttribute("content");
        const header = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");
        const strHeader = header.toString();
        // 성적 db에 올리기
        const sendData = {
            "game_kind": "QUIZ",
            "winner_id": result.winnerId,
            "loser_id": result.loserId
        };
        const param = {
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                [strHeader]: token,
            },
            method: "POST",
            body: JSON.stringify(sendData),
        };
        const fetchResult = fetch("http://localhost:8080/result/create", param);
        const dataResult = fetchResult.then((result) => {
            console.log(result);
            return result.text();
        });
        dataResult.then((data) => {
            console.log(data);
        });
        dataResult.catch((err) => {
            console.log(err);
        });
        confirm(" 정답입니다 승리기록을 올립니다 " + "winner :" + result.winnerId);
    }
    else {
        confirm(" 틀렸습니다 ");
    }
    window.location.href = "/quiz/waitingroom";
});
export {};
