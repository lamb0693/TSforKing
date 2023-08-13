export type gameDataType = {
    p0_x : number,
    p0_y : number,
    p1_x : number,
    p1_y : number,
    ballX : number,
    ballY : number,
    p0_prepared : boolean,
    p1_prepared : boolean,    
}

export type GameDataMap = {
    [key: string]: gameDataType;
}

export type StartGameParamType = {
    roomName : string
    playerNo : string
}