const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
// fetch 시  IPV4 우선 사용 설정 아니면 error
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
const Cons = {};
const JWT_TOKEN = "Bearer:" + process.argv[2];
//*********game 관련 data ********** */
const mapGameData = {};
const ioServer = new Server(server, {
    cors: {
        origin: '*'
    }
});
const quiz = ioServer.of('/quiz');
// 아래 두개의 구조는 항상 일치시키자 . 변화 시킬때 마다 update 부르고
let quizRooms = null; // adapter로 구할 방
let quizRoomsTransfer = []; // transfer 용 array를 만듬
// server의 quizRooms, quizRoomsTransfer 를 update //
const updateRoom = (quiz) => {
    quizRooms = quiz.adapter.rooms;
    quizRoomsTransfer = [];
    quizRooms.forEach((room, roomName) => {
        //console.log(roomName.length)
        //** id를 15자 이하로 꼭 하자 */
        if (roomName.length <= 15) {
            quizRoomsTransfer.push({
                'roomName': roomName,
                'roomSize': room.size
            });
        }
    });
    //console.log('roomList : ', quizRoomsTransfer)
};
const checkExistRoomByName = (roomName) => {
    let bExist;
    bExist = false;
    for (let i = 0; i < quizRoomsTransfer.length; i++) {
        if (quizRoomsTransfer[i].roomName == roomName) {
            bExist = true;
            break;
        }
    }
    console.log('checkExistRooms returns ' + bExist);
    return bExist;
};
const getRoomSize = (roomName) => {
    for (let i = 0; i < quizRoomsTransfer.length; i++) {
        if (quizRoomsTransfer[i].roomName === roomName)
            return quizRoomsTransfer[i].roomSize;
    }
    return -1;
};
const updateRoomAndSendRoomListtoAllClient = () => {
    updateRoom(quiz);
    quiz.emit('quiz_rooms_info', quizRoomsTransfer); // 방 list를 보낸다 get_room_list callback으로 대체
};
quiz.on('connection', (socket) => {
    console.log('a user connected');
    updateRoomAndSendRoomListtoAllClient();
    // 만약 게임중이면 게임을 종료하고 승리 패패 처리를 해야 함
    // 게임중이라는것은 map에 GameData가 있는지 확인하면 됨
    // map에 socketid를 넣어야 하 ㄹ듯 socketid를 이용해 
    socket.on('disconnect', () => {
        console.log('user disconnected');
        // 해당 socketid를 가진 gameData가 있는지 확인하고 받아옴
        // 게임 종료 처리를 함
        for (const [key, value] of Object.entries(mapGameData)) {
            if (value.socketid0 === socket.id) {
                console.log("player0 나감 종료 처리 필요함");
                quiz.to(value.roomName).emit('chat message', "상대방이 나갔습니다");
                endGame('player1', value.roomName);
            }
            else if (value.socketid1 === socket.id) {
                console.log("player1 나감 종료 처리 필요함");
                quiz.to(value.roomName).emit('chat message', "상대방이 나갔습니다");
                endGame('player0', value.roomName);
            }
        }
        updateRoomAndSendRoomListtoAllClient();
    });
    /*********get_room_list 에 대한 처리 ***** 없어도 되는지 체크 요망*********/
    /*********room을 updaet후 clientCallback 에 roomList 넣어 실행 **************/
    socket.on('get_room_list', (msg, clientCallback) => {
        updateRoom(quiz);
        //console.log(msg)
        //console.log('updateRoom with client callback ')
        // console.log('callback : ', quizRoomsTransfer)
        clientCallback(quizRoomsTransfer);
    });
    // *********** CREATE ROOM ******************//
    socket.on('quiz_create_room', (roomName, clientCallback) => {
        console.log('requested room name : ' + roomName);
        // 있으면 clientCallback('fail') 
        // 없으면 join(방 만들기) clientCallback('success') 실행 
        if (checkExistRoomByName(roomName)) {
            //console.log("on quiz_create_room : room exist")
            clientCallback('fail');
        }
        else {
            //console.log("make new room " + roomName)
            socket.join(roomName);
            clientCallback('success');
            updateRoomAndSendRoomListtoAllClient(); // join하면 room 현황 broadcasiting
        }
    });
    // *********** JOIN ROOM ******************//
    socket.on('quiz_join_room', (roomName, clientCallback) => {
        //console.log('requested room name : '  + roomName)
        // 있으면 join(방 조인) clientCallback('success') 실행 
        // 없으면 clientCallback('fail') 
        if (checkExistRoomByName(roomName)) {
            if (getRoomSize(roomName) >= 2) {
                clientCallback('full');
            }
            else {
                //console.log("join할 room exist  join합니다" + roomName)
                socket.join(roomName);
                clientCallback('success');
                updateRoomAndSendRoomListtoAllClient();
            }
        }
        else {
            //console.log("join room not exist " + roomName)
            clientCallback('fail');
        }
        //socket.emit('quiz_rooms_info', quizRoomsTransfer) // callbakc으로 대치
    });
    const endGame = (winner, roonName) => {
        let data = mapGameData[roonName];
        clearInterval(data.timer);
        const gameResult = {
            winner: winner,
            winnerId: null,
            loserId: null,
        };
        if (gameResult.winner === "player0") {
            gameResult.winnerId = data.player0_id;
            gameResult.loserId = data.player1_id;
        }
        else if (gameResult.winner === "player1") {
            gameResult.winnerId = data.player1_id;
            gameResult.loserId = data.player0_id;
        }
        else {
            gameResult.winnerId = "NoWinner";
            gameResult.loserId = "NoLoser";
        }
        delete mapGameData[roonName];
        console.log(winner + " Win");
        quiz.to(roonName).emit('winner', gameResult); // 승패 결과는 client에서 올림
    };
    const setProblem = (roomName) => {
        const resultProm = fetch("http://localhost:8080/quiz/token/getquiz", {
            method: "GET",
            credentials: "include",
            headers: {
                'Authorization': JWT_TOKEN
            }
        });
        const dataProm = resultProm.then((result) => {
            //console.log(result)
            return result.json();
        });
        const errorProm = dataProm.then((data) => {
            let gamedata = mapGameData[roomName];
            console.log(data);
            gamedata.problem = data["problem"];
            gamedata.select1 = data["sel1"];
            gamedata.select2 = data["sel2"];
            gamedata.select3 = data["sel3"];
            gamedata.select4 = data["sel4"];
            gamedata.answer = data["answer"];
            console.log(gamedata);
        });
        errorProm.catch((err) => {
            console.log(err);
        });
    };
    const prepareGame = (roomName, txtUserId, txtUserNick, socketId, playerNo) => {
        //gameData가 있는지 확인후 없으면 만듬 있으면 socket과 userId passwd 수정
        if (mapGameData[roomName] == null) {
            let gameData = {
                p0_prepared: false,
                p1_prepared: false,
                roomName: roomName,
                problem: null,
                select1: null,
                select2: null,
                select3: null,
                select4: null,
                answer: 0,
                callback: () => {
                    let data = mapGameData[roomName];
                    // game 진행
                    data.timeRemain--;
                    if (data.timeRemain == 0) {
                        clearInterval(data.timer);
                        data.timer = null;
                        if (data.player0_selected === data.answer)
                            endGame('player0', data.roomName);
                        else if (data.player1_selected === data.answer)
                            endGame('player1', data.roomName);
                        else
                            endGame('nowinner', data.roomName);
                    }
                    //console.log("callback : " + roomName)
                    quiz.to(roomName).emit('gameData', data);
                },
                timeRemain: 100,
                timer: null,
                socketid0: null,
                socketid1: null,
                player0_id: null,
                player1_id: null,
                player0_nickname: null,
                player1_nickname: null,
                player0_selected: -1,
                player1_selected: -1
            };
            mapGameData[roomName] = gameData;
        }
        if (playerNo == 0) {
            mapGameData[roomName].socketid0 = socket.id;
            mapGameData[roomName].player0_id = txtUserId;
            mapGameData[roomName].player0_nickname = txtUserNick;
        }
        if (playerNo == 1) {
            mapGameData[roomName].socketid1 = socket.id;
            mapGameData[roomName].player1_id = txtUserId;
            mapGameData[roomName].player1_nickname = txtUserNick;
        }
        quiz.to(roomName).emit('prepareForStart', mapGameData[roomName]);
        //console.log("emitting prepareForStart", mapGameData[roomName])
    };
    // *********** CREATE ROOM FROM GameRoom ******************//
    socket.on('quiz_create_room_from_gameroom', (roomName, txtUserId, txtUserNick, clientCallback) => {
        console.log('requested room name : ' + roomName);
        // 있으면 clientCallback('fail') 
        // 없으면 join(방 만들기) clientCallback('success') 실행 
        if (checkExistRoomByName(roomName)) {
            //console.log("on quiz_create_room : room exist")
            clientCallback('fail');
        }
        else {
            //console.log("make new room " + roomName)
            socket.join(roomName);
            clientCallback('success');
            // gameData 준비
            prepareGame(roomName, txtUserId, txtUserNick, socket.id, 0);
            updateRoomAndSendRoomListtoAllClient(); // join하면 room 현황 broadcasiting
        }
    });
    // ********** playerNo가 1이 아니라 0에서올수 있을지 확인해 보자 *********/
    // *********** JOIN ROOM FROM GameRoom******************//
    socket.on('quiz_join_room_from_gameroom', (roomName, txtUserId, txtUserNick, clientCallback) => {
        //console.log('requested room name : '  + roomName)
        // 있으면 join(방 조인) clientCallback('success') 실행 
        // 없으면 clientCallback('fail') 
        if (checkExistRoomByName(roomName)) {
            if (getRoomSize(roomName) >= 2) {
                clientCallback('full');
            }
            else {
                //console.log("join할 room exist  join합니다" + roomName)
                socket.join(roomName);
                clientCallback('success');
                updateRoomAndSendRoomListtoAllClient();
                // 2명 조인이니 prepare
                prepareGame(roomName, txtUserId, txtUserNick, socket.id, 1);
            }
        }
        else {
            //console.log("join room not exist " + roomName)
            clientCallback('fail');
        }
        //socket.emit('quiz_rooms_info', quizRoomsTransfer) // callbakc으로 대치 하였음
    });
    socket.on('startGame', (param) => {
        console.log("startGame message has come" + param.playerNo);
        // map에서 roomName을 찾음
        const myGameData = mapGameData[param.roomName];
        if (param.playerNo === 'player0')
            myGameData.p0_prepared = true;
        if (param.playerNo === 'player1')
            myGameData.p1_prepared = true;
        if (myGameData.p0_prepared == true && myGameData.p1_prepared == true) {
            setProblem(param.roomName); //문제 setting하고 timer start
            console.log(param.roomName + "Start game.... ");
            myGameData.timer = setInterval(myGameData.callback, 100);
            // Start를 시키면 stop버튼을 활성화 시키기 위해 started msg를 보내고 
            // 재시작 위해 prepared를 false로 바꿈
            // 시작되면 문제 setting
            //quiz.to(myGameData.roomName).emit('started') //*** */ 받는 부분 있나? 체크 해 보자
            myGameData.p0_prepared = false;
            myGameData.p1_prepared = false;
        }
    });
    // socket.on('stopGame', ( playerno: string, roomName : string ) => {
    //     // map에서 roomName을 찾음
    //     const myGameData : QuizDataType = mapGameData[roomName]
    //     // timer를 멈추고
    //     if(myGameData.timer != null) {
    //         clearInterval(myGameData.timer)
    //         myGameData.timer = null
    //     }
    //     // 멈추었다는 message와 멈춘 사람을 보냄
    //     quiz.to(roomName).emit('stopped', playerno)
    // })
    // socket.on('gameData', (param : gameActionParamType ) => {
    //     const data : QuizDataType = mapGameData[param.roomName]
    //     console.log(param)
    //     switch(param.action){
    //         case 'stop' :
    //             clearInterval(data.timer)
    //             break;
    //     }
    //     console.log(data)
    // })
    socket.on('answer_selected', (param) => {
        console.log('answer_selected messsage has come');
        const myGameData = mapGameData[param.roomName];
        console.log(myGameData.player0_selected, myGameData.player1_selected, param.clickedDivision);
        if (param.clickedDivision == myGameData.player0_selected)
            return;
        if (param.clickedDivision == myGameData.player1_selected)
            return;
        if (param.playerNo == 'player0')
            myGameData.player0_selected = param.clickedDivision;
        else
            myGameData.player1_selected = param.clickedDivision;
        //quiz.to(param.roomName).emit('div_selected_data', myGameData) //**** */ 화면 갱신을 양측에서 하면 안되는 듯 ****///
    });
    // ********* CHAT MESSAGE EVENT ******************//
    socket.on('chatData', (param) => {
        quiz.to(param.rommName).emit('chat message', param.nickname + ':' + param.message);
    });
});
// Program Entry Point
console.log(JWT_TOKEN);
server.listen(3002, () => {
    console.log("Quiz Server listening...3002");
});
export {};
