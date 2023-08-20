//const { io } = require("socket.io");
let playerNo;
const strRoomName = document.getElementById("divRoomName").textContent;
if (document.getElementById("divPlayerNo0") != null) {
    playerNo = document.getElementById("divPlayerNo0").textContent;
}
else {
    playerNo = document.getElementById("divPlayerNo1").textContent;
}
const p0_game_paddle = document.getElementById("p0_game_paddle");
const p1_game_paddle = document.getElementById("p1_game_paddle");
const game_ball = document.getElementById("game_ball");
const btnStart = document.getElementById("start");
const btnSendMessage = document.getElementById("btnSendMessage");
const txtChatMsg = document.getElementById("txtChatMsg");
const taChatMsg = document.getElementById("taChatMsg");
let gameData = null;
const Cons = {
    LEFT: 10,
    RIGHT: 410,
    TOP: 10,
    BOTTOM: 510,
    PADDLE_SIZE: 80,
    P0_TOP: 40,
    P1_TOP: 480,
    PAD_HALF_THICK: 10,
    BALL_RADIUS: 10
};
// // *******화면을 현재 gameData로 update ******
const updateGameBoard = () => {
    p0_game_paddle.style.left = gameData.p0_x + 'px';
    p0_game_paddle.style.top = (gameData.p0_y - Cons.PAD_HALF_THICK) + 'px';
    p1_game_paddle.style.left = gameData.p1_x + 'px';
    p1_game_paddle.style.top = (gameData.p1_y - Cons.PAD_HALF_THICK) + 'px';
    game_ball.style.left = (gameData.ballX - Cons.BALL_RADIUS) + 'px';
    game_ball.style.top = (gameData.ballY - Cons.BALL_RADIUS) + 'px';
};
const sendChatMessage = (event) => {
    event.preventDefault();
    const param = {
        rommName: strRoomName,
        playerNo: playerNo,
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
const onBtnLeftClikced = (event) => {
    event.preventDefault();
    const data = {
        roomName: strRoomName,
        playerNo: playerNo,
        action: 'btnLeftClicked'
    };
    socket.emit('gameData', data);
};
// ******* left button 관련 설정  ******
const btnLeft = document.getElementById("toLeft");
btnLeft.addEventListener('click', onBtnLeftClikced);
const onBtnRightClikced = (event) => {
    event.preventDefault();
    const data = {
        roomName: strRoomName,
        playerNo: playerNo,
        action: 'btnRightClicked'
    };
    socket.emit('gameData', data);
};
// ******* Right button 관련 설정  ******
const btnRight = document.getElementById("toRight");
btnRight.addEventListener('click', onBtnRightClikced);
const onStopButtonClikced = (event) => {
    event.preventDefault();
    socket.emit('stopGame', playerNo, strRoomName);
};
// ******* Stop button 관련 설정  ******
const btnStop = document.getElementById("stopGame");
btnStop.addEventListener('click', onStopButtonClikced);
// ******* 게임 서버 접속  ******
const socket = io("http://localhost:3000/ping", { path: "/socket.io"
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
    socket.emit('ping_create_room_from_gameroom', strRoomName, (result) => {
        makeRoomCallBack(result, strRoomName);
    });
}
//join에서 왔으면 이름의 방에 join하고 server에서 prepareGame()
if (playerNo === 'player1') {
    socket.emit('ping_join_room_from_gameroom', strRoomName, (result) => {
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
socket.on('started', () => {
    btnStop.removeAttribute('disabled');
});
socket.on('stopped', (playerno) => {
    alert(playerno + " stooped Game 준비되면 Start Button을 누르세요");
    btnStart.removeAttribute('disabled');
    btnStop.setAttribute('disabled', 'true');
});
// // ******* 받은 gameData 처리 => 화면 updata  ******
socket.on('gameData', function (msg) {
    console.log("game data", msg);
    gameData = msg;
    updateGameBoard();
});
socket.on('winner', function (winner) {
    if (playerNo === winner) {
        confirm(" 승 리 ");
    }
    else {
        confirm(" 패 배 ");
    }
    window.location.href = "/ping/waitingroom";
});
//export {};
