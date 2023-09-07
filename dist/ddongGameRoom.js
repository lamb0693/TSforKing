//const { io } = require("socket.io");
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
const divPlayer0 = document.getElementById("player0_char");
const divPlayer1 = document.getElementById("player1_char");
// div  영역 설정 //
const ddongGameDiv = document.getElementById("ddongGameBoard");
const btnSendMessage = document.getElementById("btnSendMessage");
const txtChatMsg = document.getElementById("txtChatMsg");
const taChatMsg = document.getElementById("taChatMsg");
let gameData = null;
const Cons = {
    LEFT: 10,
    RIGHT: 410,
    TOP: 10,
    BOTTOM: 510,
};
// // *******화면을 현재 gameData로 update ******
const updateGameBoard = () => {
    // 없어진 똥 그림을 지우고
    const imgsOld = ddongGameDiv.querySelectorAll('#ddongGameBoard img');
    let bExist;
    for (let imgOld of imgsOld) {
        bExist = false;
        // char  인지 체크  다음 존재하는지 체크
        if ((imgOld.id === "img_char0") || (imgOld.id === "img_char1")) {
            bExist = true;
        }
        else {
            for (let xxx of gameData.ddongs) {
                if (imgOld.id === xxx.id) {
                    bExist = true;
                    break;
                }
            }
        }
        if (!bExist)
            ddongGameDiv.removeChild(imgOld.parentElement);
    }
    // 없으면 새로 만들고, 있으면 이동
    for (let xxx of gameData.ddongs) {
        const currentDiv = document.getElementById(xxx.id);
        if (currentDiv == null) {
            const div = document.createElement('div');
            const img = document.createElement('img');
            img.src = "/image/ddong.png";
            img.alt = 'ddong';
            img.width = xxx.width;
            img.height = xxx.height;
            div.setAttribute("id", xxx.id);
            div.style.position = "absolute";
            div.style.left = "" + xxx.left + "px";
            div.style.top = "" + xxx.top + "px";
            div.style.width = "" + xxx.width + "px";
            div.style.height = "" + xxx.height + "px";
            div.appendChild(img);
            ddongGameDiv.appendChild(div);
        }
        else {
            currentDiv.style.top = "" + xxx.top + "px";
        }
    }
    // char 위치 이동
    divPlayer0.style.left = "" + gameData.p0_x + "px";
    divPlayer1.style.left = "" + gameData.p1_x + "px";
};
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
const socket = io("http://localhost:3004/ddong", { path: "/socket.io"
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
    socket.emit('ddong_create_room_from_gameroom', strRoomName, txtUserId, txtUserNick, (result) => {
        makeRoomCallBack(result, strRoomName);
    });
}
//join에서 왔으면 이름의 방에 join하고 server에서 prepareGame()
if (playerNo === 'player1') {
    socket.emit('ddong_join_room_from_gameroom', strRoomName, txtUserId, txtUserNick, (result) => {
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
socket.on('winner', function (result) {
    if (playerNo === result.winner) {
        const token = document.querySelector('meta[name="_csrf"]').getAttribute("content").toString();
        const header = document.querySelector('meta[name="_csrf_header"]').getAttribute("content").toString();
        // 성적 db에 올리기
        const sendData = {
            "game_kind": "LADDER",
            "winner_id": result.winnerId,
            "loser_id": result.loserId
        };
        fetch("http://localhost:8080/result/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [header]: token,
            },
            body: JSON.stringify(sendData),
        })
            .then((result) => {
            console.log(result);
            return result.text();
        })
            .then((data) => {
            console.log(data);
        })
            .catch((err) => {
            console.log(err);
        });
        confirm(" 승 리 " + "winner :" + result.winnerId + " loser :" + result.loserId);
    }
    else {
        confirm(" 패 배 ");
    }
    window.location.href = "/ddong/waitingroom";
});
//export {};
