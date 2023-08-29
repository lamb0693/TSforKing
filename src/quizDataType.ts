export type QuizDataType = {
    p0_prepared : boolean,
    p1_prepared : boolean,  
    roomName : string,
    problem : string,
    select1 : string,
    select2 : string,
    select3 : string,
    select4 : string,
    answer : number,  
    timeRemain : number,
    timer : any,
    callback : (roomName : string) => void,
    socketid0 : string,
    socketid1 : string,
    player0_id : string,
    player1_id : string,
    player0_nickname : string,
    player1_nickname : string,
    player0_selected : number,
    player1_selected : number,
}


export type GameDataMap = {
    [key: string]: QuizDataType;
}

export type QuizType = {
    no : number,
    quiz : string,
    sel1 : string,
    sel2 : string,
    sel3 : string,
    answer : number
}

export type SelAnswerParamType = {
    roomName : string,
    playerNo : string,
    clickedDivision : number
}