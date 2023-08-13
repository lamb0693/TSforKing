const { io } = require("socket.io");
const strRoomName = document.getElementById("divRoomName").textContent;
const plyaerNo = document.getElementById("divPlayerNo").textContent;
const p0_game_paddle = document.getElementById("p0_game_paddle");
const p1_game_paddle = document.getElementById("p1_game_paddle");
const game_ball = document.getElementById("game_ball");
const btnStart = document.getElementById("start");
let gameData = null;
// // *******게임 데이타 관련 설정******
// // ******* 접속시 바로 데이터 받는 것으로 고치자
// let gameData = null
// const game_paddle = document.getElementById("game_paddle")
//
// // *******화면을 현재 gameData로 update ******
const updateGameBoard = () => {
    p0_game_paddle.style.left = gameData.p0_x + 'px';
    p0_game_paddle.style.top = gameData.p0_y + 'px';
    p1_game_paddle.style.left = gameData.p1_x + 'px';
    p1_game_paddle.style.top = gameData.p1_y + 'px';
    game_ball.style.left = gameData.ballX + 'px';
    game_ball.style.top = gameData.ballY + 'px';
};
// // ******* start button 클릭하면 server로 전송  ******
const onStartButtonClicked = (event) => {
    event.preventDefault();
    const param = {
        roomName: strRoomName,
        playerNo: plyaerNo
    };
    socket.emit('startGame', param);
};
btnStart.addEventListener('click', onStartButtonClicked);
//
// const onBtnLeftClikced = (event) => {
//     event.preventDefault()
//     cknull(socket, "socket")
//     socket.emit('gameData', playerNo + 'btn_left')
// }
//
// // ******* left button 관련 설정  ******
// const btnLeft = document.getElementById("toLeft")
// cknull(btnLeft, "btnLeft")
// btnLeft.addEventListener('click', onBtnLeftClikced)
//
// const onBtnRightClikced = (event) => {
//     event.preventDefault()
//     cknull(socket, "socket")
//     socket.emit('gameData', playerNo + 'btn_right')
// }
//
// // ******* Right button 관련 설정  ******
// const btnRight = document.getElementById("toRight")
// cknull(btnRight, "btnRight")
// btnRight.addEventListener('click', onBtnRightClikced)
//
// const onStopButtonClikced = (event) => {
//     event.preventDefault()
//     cknull(socket, "socket")
//     socket.emit('gameData', playerNo + 'stop')
// }
//
// // ******* Stop button 관련 설정  ******
// const btnStop = document.getElementById("stopGame")
// cknull(btnStop, "btnStop")
// btnStop.addEventListener('click', onStopButtonClikced)
//
//
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
if (plyaerNo === 'player0') {
    // 이름의 방을 만든다
    socket.emit('ping_create_room', strRoomName, (result) => {
        makeRoomCallBack(result, strRoomName);
    });
}
//join에서 왔으면 이름의 방에 join하고 server에서 prepareGame()
if (plyaerNo === 'player1') {
    socket.emit('ping_join_room_from_gameroom', strRoomName, (result) => {
        joinRoomCallBack(result, strRoomName);
    });
}
//
//
// // ******* 채팅 메시지 emit  ******
// socket.on('chat message', function(msg) {
//     console.log("chat message", msg)
// });
//
// // ********* 서버 풀이면
// socket.on('serverFull', function(msg) {
//     alert(msg)
// });
//
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
    updateGameBoard();
});
export {};
//
// // ******* 받은 접속자 list  ******
// socket.on('clients', function(msg) {
//     console.log("clients", msg)
// });
//
// socket.on('player', function(msg) {
//     if(playerNo == -1) {
//         playerNo = msg
//         player_no.innerHTML = "Player" + msg
//     }
// })
//
// socket.on('winner', function(msg) {
//     if(playerNo == msg) alert(" 승 리 ")
//     else alert(" 패 배 ")
//
// })
// *********** 다 정리 되었으면 게임 화면 update
// ********* 초기 데이터를 서버에서 받는 것으로 고치자
//*********인삿말 대신 받자
//updateGameBoard()  // 인사말로 gameData가 옴
