const btnCheckExistId : HTMLButtonElement = document.getElementById("btnCheckExistId") as HTMLButtonElement | null
if(btnCheckExistId == null) console.log("****** Error : btnCheckExistId : null ******")

const checkExistId = () : void => {
    fetch("http://localhost:8080/member/exist/mar189@naver.com")
    .then( (result) => {
        console.log(result)
        const data   = result.json()
    })
    .then( (data ) => {
        console.log(data);
    })
    .catch( (error) => {
        console.log(error)
    })
}

btnCheckExistId.addEventListener('click', checkExistId)