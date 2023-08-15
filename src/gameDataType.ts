export type gameDataType = {
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
    socketid1 : string
}

export type GameDataMap = {
    [key: string]: gameDataType;
}

export type StartGameParamType = {
    roomName : string,
    playerNo : string
}

export type gameActionParamType = {
    roomName : string,
    playerNo : string,
    action : string
}