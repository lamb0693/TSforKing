const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
//*********game 관련 data ********** */
const mapGameData = {};
const ioServer = new Server(server, {
    cors: {
        origin: '*'
    }
});
const ping = ioServer.of('/ping');
// 아래 두개의 구조는 항상 일치시키자 . 변화 시킬때 마다 update 부르고
let pingRooms = null; // adapter로 구할 방
let pingRoomsTransfer = []; // transfer 용 array를 만듬
// server의 pingRooms, pingRoomsTransfer 를 update //
const updateRoom = (ping) => {
    pingRooms = ping.adapter.rooms;
    pingRoomsTransfer = [];
    pingRooms.forEach((room, roomName) => {
        //console.log(roomName.length)
        //** id를 15자 이하로 꼭 하자 */
        if (roomName.length <= 15) {
            pingRoomsTransfer.push({
                'roomName': roomName,
                'roomSize': room.size
            });
        }
    });
    //console.log('roomList : ', pingRoomsTransfer)
};
const checkExistRoomByName = (roomName) => {
    let bExist;
    bExist = false;
    for (let i = 0; i < pingRoomsTransfer.length; i++) {
        if (pingRoomsTransfer[i].roomName == roomName) {
            bExist = true;
            break;
        }
    }
    console.log('checkExistRooms returns ' + bExist);
    return bExist;
};
const getRoomSize = (roomName) => {
    for (let i = 0; i < pingRoomsTransfer.length; i++) {
        if (pingRoomsTransfer[i].roomName === roomName)
            return pingRoomsTransfer[i].roomSize;
    }
    return -1;
};
const updateRoomAndSendRoomListtoAllClient = () => {
    updateRoom(ping);
    ping.emit('ping_rooms_info', pingRoomsTransfer); // 방 list를 보낸다 get_room_list callback으로 대체
};
ping.on('connection', (socket) => {
    console.log('a user connected');
    updateRoomAndSendRoomListtoAllClient();
    // 만약 게임중이면 게임을 종료하고 승리 패패 처리를 해야 함
    // 게임중이라는것은 map에 GameData가 있는지 확인하면 됨
    // map에 socketid를 넣어야 하 ㄹ듯 socketid를 이용해 
    socket.on('disconnect', () => {
        console.log('user disconnected');
        ping.emit('chat message', "1명 나갔어요");
        // 해당 socketid를 가진 gameData가 있는지 확인하고 받아옴
        // 게임 종료 처리를 함
        for (const [key, value] of Object.entries(mapGameData)) {
            if (value.socketid0 === socket.id) {
                console.log("player0 나감 종료 처리 필요함");
                endGame('player1', value.roomName);
            }
            else if (value.socketid1 === socket.id) {
                console.log("player1 나감 종료 처리 필요함");
                endGame('player0', value.roomName);
            }
        }
        updateRoomAndSendRoomListtoAllClient();
    });
    /*********get_room_list 에 대한 처리 ***** 없어도 되는지 체크 요망*********/
    /*********room을 updaet후 clientCallback 에 roomList 넣어 실행 **************/
    socket.on('get_room_list', (msg, clientCallback) => {
        updateRoom(ping);
        //console.log(msg)
        //console.log('updateRoom with client callback ')
        // console.log('callback : ', pingRoomsTransfer)
        clientCallback(pingRoomsTransfer);
    });
    // *********** CREATE ROOM ******************//
    socket.on('ping_create_room', (roomName, clientCallback) => {
        console.log('requested room name : ' + roomName);
        // 있으면 clientCallback('fail') 
        // 없으면 join(방 만들기) clientCallback('success') 실행 
        if (checkExistRoomByName(roomName)) {
            //console.log("on ping_create_room : room exist")
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
    socket.on('ping_join_room', (roomName, clientCallback) => {
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
        //socket.emit('ping_rooms_info', pingRoomsTransfer) // callbakc으로 대치
    });
    const endGame = (winner, roonName) => {
        let data = mapGameData[roonName];
        clearInterval(data.timer);
        delete mapGameData[roonName];
        // ** *******************/
        //** 승패 결과 Ajax로 up */
        // ******************* */
        console.log(winner + " Win");
        ping.to(roonName).emit('winner', winner);
    };
    const prepareGame = (roomName, socketId, playerNo) => {
        //gameData가 있는지 확인후 없으면 만듬 있으면 socket만 수정
        if (mapGameData[roomName] == null) {
            let gameData = {
                gameId: 'ping' + Date.now(),
                p0_x: 200,
                p0_y: 130,
                p1_x: 200,
                p1_y: 580,
                ballX: 200,
                ballY: 200,
                ballMoveX: 5,
                ballMoveY: 5,
                p0_prepared: false,
                p1_prepared: false,
                roomName: roomName,
                callback: () => {
                    let data = mapGameData[roomName];
                    data.ballX += data.ballMoveX;
                    if (data.ballX > 390 || data.ballX < 20)
                        data.ballMoveX *= (-1);
                    data.ballY += data.ballMoveY;
                    if (data.ballY > 590 || data.ballY < 120)
                        data.ballMoveY *= (-1);
                    if (data.ballY >= 565 && data.ballY <= 575) {
                        if ((data.p1_x > (data.ballX - 100)) && (data.p1_x < data.ballX))
                            data.ballMoveY *= (-1);
                    }
                    if (data.ballY >= 125 && data.ballY <= 135) {
                        if ((gameData.p0_x > (data.ballX - 100)) && (data.p0_x < data.ballX))
                            data.ballMoveY *= (-1);
                    }
                    if (data.ballY < 120)
                        endGame('player1', data.roomName);
                    if (gameData.ballY > 580)
                        endGame('player0', data.roomName);
                    //console.log("callback : " + roomName)
                    ping.to(roomName).emit('gameData', data);
                },
                timer: null,
                socketid0: null,
                socketid1: null
            };
            mapGameData[roomName] = gameData;
        }
        if (playerNo == 0)
            mapGameData[roomName].socketid0 = socket.id;
        if (playerNo == 1)
            mapGameData[roomName].socketid1 = socket.id;
        ping.to(roomName).emit('prepareForStart', mapGameData[roomName]);
        //console.log("emitting prepareForStart", mapGameData[roomName])
    };
    // *********** CREATE ROOM FROM GameRoom ******************//
    socket.on('ping_create_room_from_gameroom', (roomName, clientCallback) => {
        console.log('requested room name : ' + roomName);
        // 있으면 clientCallback('fail') 
        // 없으면 join(방 만들기) clientCallback('success') 실행 
        if (checkExistRoomByName(roomName)) {
            //console.log("on ping_create_room : room exist")
            clientCallback('fail');
        }
        else {
            //console.log("make new room " + roomName)
            socket.join(roomName);
            clientCallback('success');
            // gameData 준비
            prepareGame(roomName, socket.id, 0);
            updateRoomAndSendRoomListtoAllClient(); // join하면 room 현황 broadcasiting
        }
    });
    // ********** playerNo가 1이 아니라 0에서올수 있을지 확인해 보자 *********/
    // *********** JOIN ROOM FROM GameRoom******************//
    socket.on('ping_join_room_from_gameroom', (roomName, clientCallback) => {
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
                prepareGame(roomName, socket.id, 1);
            }
        }
        else {
            //console.log("join room not exist " + roomName)
            clientCallback('fail');
        }
        //socket.emit('ping_rooms_info', pingRoomsTransfer) // callbakc으로 대치 하였음
    });
    socket.on('startGame', (param) => {
        // map에서 roomName을 찾음
        const myGameData = mapGameData[param.roomName];
        if (param.playerNo === 'player0')
            myGameData.p0_prepared = true;
        if (param.playerNo === 'player1')
            myGameData.p1_prepared = true;
        if (myGameData.p0_prepared == true && myGameData.p1_prepared == true) {
            console.log(param.roomName + "Start game.... ");
            myGameData.timer = setInterval(myGameData.callback, 100);
            // Start를 시키면 stop버튼을 활성화 시키기 위해 started msg를 보내고 
            // 재시작 위해 prepared를 false로 바꿈
            ping.to(myGameData.roomName).emit('started');
            myGameData.p0_prepared = false;
            myGameData.p1_prepared = false;
        }
    });
    socket.on('stopGame', (playerno, roomName) => {
        // map에서 roomName을 찾음
        const myGameData = mapGameData[roomName];
        // timer를 멈추고
        if (myGameData.timer != null) {
            clearInterval(myGameData.timer);
            myGameData.timer = null;
        }
        // 멈추었다는 message와 멈춘 사람을 보냄
        ping.to(roomName).emit('stopped', playerno);
    });
    socket.on('gameData', (param) => {
        const data = mapGameData[param.roomName];
        console.log(param);
        switch (param.action) {
            case 'btnLeftClicked':
                if (param.playerNo === 'player0') {
                    //console.log("0 l")
                    if (data.p0_x > 20)
                        data.p0_x -= 10;
                }
                else if (param.playerNo === 'player1') {
                    if (data.p1_x > 20)
                        data.p1_x -= 10;
                    //console.log("1 l")
                }
                break;
            case 'btnRightClicked':
                if (param.playerNo === 'player0') {
                    //console.log("0 r")
                    if (data.p0_x < 400)
                        data.p0_x += 10;
                }
                else if (param.playerNo === 'player1') {
                    if (data.p1_x < 400)
                        data.p1_x += 10;
                    //console.log("1 r")
                }
                break;
            case 'stop':
                clearInterval(data.timer);
                break;
        }
        console.log(data);
    });
    // ********* CHAT MESSAGE EVENT ******************//
    socket.on('chat message', (msg) => {
        ping.emit('chat message', msg);
    });
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});
//export {};
