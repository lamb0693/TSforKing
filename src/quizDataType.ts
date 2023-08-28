export type QuizDataType = {
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
    [key: string]: QuizDataType;
}
