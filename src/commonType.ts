export type StartGameParamType = {
    roomName : string,
    playerNo : string
}

export type gameActionParamType = {
    roomName : string,
    playerNo : string,
    action : string
}

export type ChatParaType = {
    rommName : string,
    nickname : string,
    message : string
}

export type GameResultParaType = {
    winner : string,
    winnerId : string,
    loserId : string
}