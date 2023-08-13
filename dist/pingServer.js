const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
//*********game 관련 data ********** */
const mapGameData = {};
//let gameData = {'p0_paddleX' : 200, 'p0_paddleY' : 130, 'p1_paddleX' : 200, 'p1_paddleY' : 580, 'ballX' : 200, 'ballY' :200 }
let ballMoveX = 5;
let ballMoveY = 5;
const ioServer = new Server(server, {
    cors: {
        origin: '*'
    }
});
const ping = ioServer.of('/ping');
const gawi = ioServer.of('/gawi');
const quiz = ioServer.of('/quiz');
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
const sendRoomListtoAllClient = () => {
    updateRoom(ping);
    ping.emit('ping_rooms_info', pingRoomsTransfer); // 방 list를 보낸다 get_room_list callback으로 대체
};
ping.on('connection', (socket) => {
    console.log('a user connected');
    sendRoomListtoAllClient();
    socket.on('disconnect', () => {
        console.log('user disconnected');
        ping.emit('chat message', "1명 나갔어요");
        sendRoomListtoAllClient();
    });
    /*********get_room_list 에 대한 처리 **************/
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
            sendRoomListtoAllClient(); // join하면 room 현황 broadcasiting
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
                sendRoomListtoAllClient();
            }
        }
        else {
            //console.log("join room not exist " + roomName)
            clientCallback('fail');
        }
        //socket.emit('ping_rooms_info', pingRoomsTransfer) // callbakc으로 대치
    });
    const prepareGame = (roomName) => {
        //===== gameData가 referece var 이냐 새로 만드나 ? 나중에 확인후 수정 =========//
        let gameData = {
            p0_x: 200,
            p0_y: 130,
            p1_x: 200,
            p1_y: 580,
            ballX: 200,
            ballY: 200,
            p0_prepared: false,
            p1_prepared: false,
        };
        mapGameData[roomName] = gameData;
        ping.to(roomName).emit('prepareForStart', gameData);
        console.log("emitting prepareForStart");
    };
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
                sendRoomListtoAllClient();
                // 2명 조인이니 prepare
                prepareGame(roomName);
            }
        }
        else {
            //console.log("join room not exist " + roomName)
            clientCallback('fail');
        }
        //socket.emit('ping_rooms_info', pingRoomsTransfer) // callbakc으로 대치
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
        }
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
