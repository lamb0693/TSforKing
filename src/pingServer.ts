const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

import { gameDataType } from "./gameDataType";
import { GameDataMap, StartGameParamType, gameActionParamType, ChatParaType, GameResultParaType } from "./gameDataType";


const Cons = {
    LEFT : 10,
    RIGHT : 410,
    TOP : 10,
    BOTTOM : 510,
    PADDLE_SIZE : 80,
    P0_TOP : 40, // 30-50
    P1_TOP : 480, // 470-490
    PAD_HALF_THICK : 10, 
    BALL_RADIUS : 10
}

//*********game 관련 data ********** */
const mapGameData : GameDataMap = {}

const ioServer = new Server(server, {
  cors: {
    origin: '*'
  }
});

const ping = ioServer.of('/ping')


// 아래 두개의 구조는 항상 일치시키자 . 변화 시킬때 마다 update 부르고
let pingRooms = null  // adapter로 구할 방
let pingRoomsTransfer = [] // transfer 용 array를 만듬

// server의 pingRooms, pingRoomsTransfer 를 update //
const updateRoom = (ping) => {
    pingRooms = ping.adapter.rooms;
    pingRoomsTransfer = []
    pingRooms.forEach( (room, roomName) => {
        //console.log(roomName.length)
        //** id를 15자 이하로 꼭 하자 */
        if(roomName.length <= 15){
            pingRoomsTransfer.push( {
                'roomName' : roomName,
                'roomSize' : room.size
            } )
        }
    })
    //console.log('roomList : ', pingRoomsTransfer)
}

const checkExistRoomByName = (roomName) => {
    let bExist : boolean
    bExist = false
    for(let i:number =0; i<pingRoomsTransfer.length; i++){
        if(pingRoomsTransfer[i].roomName == roomName){
            bExist = true
            break
        } 
    }
    console.log('checkExistRooms returns ' + bExist)
    return bExist
}

const getRoomSize = (roomName) => {
    for(let i:number =0; i<pingRoomsTransfer.length; i++){
        if( pingRoomsTransfer[i].roomName === roomName) return pingRoomsTransfer[i].roomSize
    }
    return -1
}

const updateRoomAndSendRoomListtoAllClient = () => {
    updateRoom(ping) 
    ping.emit('ping_rooms_info', pingRoomsTransfer )  // 방 list를 보낸다 get_room_list callback으로 대체
}

ping.on('connection', (socket) => {
    console.log('a user connected')
    updateRoomAndSendRoomListtoAllClient()

    // 만약 게임중이면 게임을 종료하고 승리 패패 처리를 해야 함
    // 게임중이라는것은 map에 GameData가 있는지 확인하면 됨
    // map에 socketid를 넣어야 하 ㄹ듯 socketid를 이용해 
    socket.on('disconnect', () => {
        console.log('user disconnected');

        // 해당 socketid를 가진 gameData가 있는지 확인하고 받아옴
        // 게임 종료 처리를 함
        for(const [key, value] of Object.entries(mapGameData)){
            if(value.socketid0 === socket.id){
                console.log("player0 나감 종료 처리 필요함")
                ping.to(value.roomName).emit('chat message', "상대방이 나갔습니다")
                endGame('player1', value.roomName)
            } else if(value.socketid1 === socket.id){
                console.log("player1 나감 종료 처리 필요함") 
                ping.to(value.roomName).emit('chat message', "상대방이 나갔습니다")
                endGame('player0', value.roomName)  
            }
        }

        updateRoomAndSendRoomListtoAllClient()
      });

    /*********get_room_list 에 대한 처리 ***** 없어도 되는지 체크 요망*********/
    /*********room을 updaet후 clientCallback 에 roomList 넣어 실행 **************/
    socket.on('get_room_list', (msg : string, clientCallback) => {
        updateRoom(ping)
        //console.log(msg)
        //console.log('updateRoom with client callback ')
        // console.log('callback : ', pingRoomsTransfer)
        clientCallback(pingRoomsTransfer)
    })  
      
    // *********** CREATE ROOM ******************//
    socket.on('ping_create_room', (roomName : string, clientCallback : (msg:string)=>void ) => {
        console.log('requested room name : '  + roomName)

        // 있으면 clientCallback('fail') 
        // 없으면 join(방 만들기) clientCallback('success') 실행 
        if( checkExistRoomByName(roomName) ) {
            //console.log("on ping_create_room : room exist")
            clientCallback('fail')
        } else {
            //console.log("make new room " + roomName)
            socket.join(roomName)
            clientCallback('success')
            updateRoomAndSendRoomListtoAllClient() // join하면 room 현황 broadcasiting
        }
    })    

    // *********** JOIN ROOM ******************//
    socket.on('ping_join_room', (roomName, clientCallback : (msg:string)=>void ) => {
        //console.log('requested room name : '  + roomName)
        // 있으면 join(방 조인) clientCallback('success') 실행 
        // 없으면 clientCallback('fail') 
        if( checkExistRoomByName(roomName)) {
            if( getRoomSize(roomName) >=2 ){
                clientCallback('full')
            } else {
                //console.log("join할 room exist  join합니다" + roomName)
                socket.join(roomName)
                clientCallback('success')
                updateRoomAndSendRoomListtoAllClient()
            }
        } else {
            //console.log("join room not exist " + roomName)
            clientCallback('fail')
        }
        //socket.emit('ping_rooms_info', pingRoomsTransfer) // callbakc으로 대치
    })  

    const endGame = (winner : string, roonName : string) => {
        let data : gameDataType = mapGameData[roonName]
        
        clearInterval(data.timer)

        const gameResult : GameResultParaType  = {
            winner : winner,
            winnerId : null,
            loserId : null, 
        }
        if (gameResult.winner === "player0" ) {
            gameResult.winnerId = data.player0_id
            gameResult.loserId = data.player1_id
        } else {
            gameResult.winnerId = data.player1_id
            gameResult.loserId = data.player0_id   
        }
        
        delete mapGameData[roonName]
        // ** *******************/
        //** 승패 결과 Ajax로 up */
        // ******************* */
        console.log(winner + " Win")

        ping.to(roonName).emit('winner', gameResult)
    }

    const prepareGame = (roomName : string, txtUserId : string, txtUserNick : string, socketId : string, playerNo : number) => {
        //gameData가 있는지 확인후 없으면 만듬 있으면 socket과 userId passwd 수정
        if( mapGameData[roomName] == null ) {
            let gameData : gameDataType = {
                gameId : 'ping' + Date.now(),
                p0_x: 200,
                p0_y: Cons.P0_TOP,
                p1_x: 200,
                p1_y: Cons.P1_TOP,
                ballX: 200,
                ballY: 200,
                ballMoveX : 5,
                ballMoveY : 5,
                p0_prepared: false,
                p1_prepared: false,
                roomName : roomName,
                callback: () => {
                    let data : gameDataType = mapGameData[roomName]
                    
                    // 그릴때 볼 패들-Height는 중심을 기준으로 그림, 패들-width는 현 pos에서 우측으로 그림  을 참고해서
                    // 수평 이동
                    data.ballX += data.ballMoveX
                    if( (data.ballX + Cons.BALL_RADIUS) > Cons.RIGHT || (data.ballX-Cons.BALL_RADIUS) < Cons.LEFT) data.ballMoveX *= (-1)

                    // 수직이동 아래 벽 체크 - 끝이니
                    data.ballY += data.ballMoveY
                    if( (data.ballY+Cons.BALL_RADIUS)> Cons.BOTTOM || (data.ballY-Cons.BALL_RADIUS) < Cons.TOP) data.ballMoveY *= (-1)

                    // player1 패들 체크  하부 패들
                    if( data.ballMoveY > 0 && (data.ballY+Cons.BALL_RADIUS) > (Cons.P1_TOP-Cons.PAD_HALF_THICK) ) {  //볼 하부 > 패들 상부  통과후는 게임 종료 됨
                      if( data.ballX > gameData.p1_x && ( data.ballX < data.p1_x+Cons.PADDLE_SIZE) ) data.ballMoveY *= (-1)
                    }

                    // player0 패들 체크 상부 패들  올라가는 경우에만
                    if(  data.ballMoveY < 0 && (data.ballY-Cons.BALL_RADIUS) < (Cons.P0_TOP+Cons.PAD_HALF_THICK) ){ //볼 상부 < 패들 하부  통과후는 게임 종료 됨
                      if( data.ballX > gameData.p0_x && ( data.ballX < data.p0_x+Cons.PADDLE_SIZE) ) data.ballMoveY *= (-1)
                    }

                    // 놓치면 게임 종료
                    if( (data.ballY) < (Cons.P0_TOP - Cons.PAD_HALF_THICK) ) endGame('player1', data.roomName)
                    if( (data.ballY) > (Cons.P1_TOP + Cons.PAD_HALF_THICK) ) endGame('player0', data.roomName)
                    console.log(data.ballY+Cons.BALL_RADIUS, Cons.P0_TOP - Cons.PAD_HALF_THICK, Cons.P1_TOP + Cons.PAD_HALF_THICK)

                    //console.log("callback : " + roomName)
                    ping.to(roomName).emit('gameData', data)
                },
                timer : null,
                socketid0 : null,
                socketid1 : null,
                player0_id : null,
                player1_id : null,
                player0_nickname : null,
                player1_nickname : null
            };

            mapGameData[roomName] = gameData
        }
        if(playerNo==0) {
            mapGameData[roomName].socketid0 = socket.id
            mapGameData[roomName].player0_id = txtUserId
            mapGameData[roomName].player0_nickname = txtUserNick
        }
        if(playerNo==1) {
            mapGameData[roomName].socketid1 = socket.id
            mapGameData[roomName].player1_id = txtUserId
            mapGameData[roomName].player1_nickname = txtUserNick
        } 
    
        ping.to(roomName).emit('prepareForStart', mapGameData[roomName])
        //console.log("emitting prepareForStart", mapGameData[roomName])
    }
    
    // *********** CREATE ROOM FROM GameRoom ******************//
    socket.on('ping_create_room_from_gameroom', (roomName : string, txtUserId : string, txtUserNick : string,
            clientCallback : (result :string)=>void ) => {
        console.log('requested room name : '  + roomName)

        // 있으면 clientCallback('fail') 
        // 없으면 join(방 만들기) clientCallback('success') 실행 
        if( checkExistRoomByName(roomName) ) {
            //console.log("on ping_create_room : room exist")
            clientCallback('fail')
        } else {
            //console.log("make new room " + roomName)
            socket.join(roomName)
            clientCallback('success')
            // gameData 준비
            prepareGame(roomName, txtUserId, txtUserNick, socket.id, 0)
            updateRoomAndSendRoomListtoAllClient() // join하면 room 현황 broadcasiting
        }
    })  
    
    // ********** playerNo가 1이 아니라 0에서올수 있을지 확인해 보자 *********/
    // *********** JOIN ROOM FROM GameRoom******************//
    socket.on('ping_join_room_from_gameroom', (roomName : string, txtUserId : string, txtUserNick : string,
            clientCallback : (result :string)=>void) => {
        //console.log('requested room name : '  + roomName)
        // 있으면 join(방 조인) clientCallback('success') 실행 
        // 없으면 clientCallback('fail') 
        if( checkExistRoomByName(roomName)) {
            if( getRoomSize(roomName) >=2 ){
                clientCallback('full')
            } else {
                //console.log("join할 room exist  join합니다" + roomName)
                socket.join(roomName)
                clientCallback('success')
                updateRoomAndSendRoomListtoAllClient()
                // 2명 조인이니 prepare
                prepareGame(roomName, txtUserId, txtUserNick, socket.id, 1)
            }
        } else {
            //console.log("join room not exist " + roomName)
            clientCallback('fail')
        }
        //socket.emit('ping_rooms_info', pingRoomsTransfer) // callbakc으로 대치 하였음
    }) 
    
    socket.on('startGame', (param : StartGameParamType) => {
        // map에서 roomName을 찾음
        const myGameData : gameDataType = mapGameData[param.roomName]
        if(param.playerNo === 'player0') myGameData.p0_prepared = true
        if(param.playerNo === 'player1') myGameData.p1_prepared = true
        if(myGameData.p0_prepared==true && myGameData.p1_prepared == true){
            console.log(param.roomName + "Start game.... ")
            myGameData.timer = setInterval(myGameData.callback, 100)
            // Start를 시키면 stop버튼을 활성화 시키기 위해 started msg를 보내고 
            // 재시작 위해 prepared를 false로 바꿈
            ping.to(myGameData.roomName).emit('started')
            myGameData.p0_prepared = false
            myGameData.p1_prepared = false
        }
    })

    socket.on('stopGame', ( playerno: string, roomName : string ) => {
        // map에서 roomName을 찾음
        const myGameData : gameDataType = mapGameData[roomName]
        // timer를 멈추고
        if(myGameData.timer != null) {
            clearInterval(myGameData.timer)
            myGameData.timer = null
        }
        // 멈추었다는 message와 멈춘 사람을 보냄
        ping.to(roomName).emit('stopped', playerno)
    })


    socket.on('gameData', (param : gameActionParamType ) => {
        const data : gameDataType = mapGameData[param.roomName]
        console.log(param)

        switch(param.action){
            case 'btnLeftClicked' :
                if(param.playerNo==='player0'){
                    //console.log("0 l")
                    data.p0_x -= 10
                    if(data.p0_x < Cons.LEFT) data.p0_x = Cons.LEFT
                } else if(param.playerNo==='player1') {
                    data.p1_x -=10
                    if(data.p1_x < Cons.LEFT) data.p1_x= Cons.LEFT
                    //console.log("1 l")
                }  
                break;
            case 'btnRightClicked' :
                if(param.playerNo==='player0'){
                    //console.log("0 r")
                    data.p0_x += 10
                    if(data.p0_x + Cons.PADDLE_SIZE > Cons.RIGHT) data.p0_x = Cons.RIGHT-Cons.PADDLE_SIZE
                } else if(param.playerNo==='player1') {
                    data.p1_x += 10
                    if(data.p1_x + Cons.PADDLE_SIZE > Cons.RIGHT) data.p1_x = Cons.RIGHT-Cons.PADDLE_SIZE
                    //console.log("1 r")
                } 
                break;
            case 'stop' :
                clearInterval(data.timer)
                break;
        }
        console.log(data)
    })


    // ********* CHAT MESSAGE EVENT ******************//
    socket.on('chatData', (param : ChatParaType ) => {
        ping.to(param.rommName).emit('chat message', param.nickname+':'+param.message);
    });

});

server.listen(3000, () => {
    console.log('listening on *:3000');
});