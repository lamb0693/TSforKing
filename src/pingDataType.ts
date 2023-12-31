export type PingDataType = {
    gameId : string,
    p0_x : number,
    p0_y : number,
    p1_x : number,
    p1_y : number,
    ballX : number,
    ballY : number,
    ballMoveX : number,
    ballMoveY : number,
    p0_prepared : boolean,
    p1_prepared : boolean,  
    roomName : string,  
    timer : any,
    callback : (roomName : string) => void,
    socketid0 : string,
    socketid1 : string,
    player0_id : string,
    player1_id : string,
    player0_nickname : string,
    player1_nickname : string
}

export type GameDataMap = {
    [key: string]: PingDataType;
}

