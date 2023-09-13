import { SERVER_IP } from "./serverUrl";

const txtId : HTMLInputElement = document.getElementById("id") as HTMLInputElement | null
if (txtId == null)
    console.log("****** Error : txtId : null ******");

const divExistID : HTMLDivElement = document.getElementById("divExistId") as HTMLDivElement | null
if (divExistID == null)
    console.log("****** Error : divExistID : null ******");

const txtNickname : HTMLInputElement = document.getElementById("nickname") as HTMLInputElement | null
if (txtNickname == null)
    console.log("****** Error : txtNickname : null ******");

const divExistNickname : HTMLDivElement = document.getElementById("divExistNickname") as HTMLDivElement | null
if (divExistNickname == null)
    console.log("****** Error : divExistID : null ******");

const checkExistId = (event : InputEvent) => {
    event.preventDefault();

    if(txtId.value.length<3) {
        divExistID.innerHTML = "사용할 수 없는 ID입니다"
        return
    }
    const resultPromise = fetch("http://" + SERVER_IP + "/member/exist/id/" + txtId.value) 

    const dataPromise  = resultPromise.then( (res) => {
        //throw new Error("My Error")
        return res.text();
    })

    const errorPromise = dataPromise.then((result) =>{
        console.log(result);
        if(result==='true') divExistID.innerHTML = "다른 사용자가 사용중인 id 입니다"
        else divExistID.innerHTML = "사용할 수 있는 id 입니다"  
    })
      
    errorPromise.catch( (err) => {
        console.log(err);
    })
}   
    
    // fetch("http://localhost:8080/member/exist/id/" + txtId.value)
    //     .then((response) => {
    //         return response.text()
    //     })
    //     .then( (data) => {
    //         console.log(data);
    //         if(data==='true'){
    //             divExistID.innerHTML = "다른 사용자가 사용중인 id 입니다"
    //         } else{
    //             divExistID.innerHTML = "사용할 수 있는 id 입니다"
    //         }
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //     });
    // };

txtId.addEventListener('input', checkExistId);

const checkExistNickname = (event : InputEvent) => {
    event.preventDefault();

    if(txtNickname.value.length<3) {
        divExistNickname.innerHTML="3자 이상이어야 합니다"
        return
    }

    const checkNick = async () => {
        const fetchResult = await fetch("http://" + SERVER_IP + "/member/exist/nickname/" + txtNickname.value)
        console.log(fetchResult);

        const dataResult = await fetchResult.text() // promise를 reutrn
        console.log(dataResult)
        if(dataResult==='true') divExistNickname.innerHTML = "다른 사용자가 사용중인 Nickname 입니다"
        else divExistNickname.innerHTML = "사용할 수 있는 Nickname 입니다"

        return dataResult // promise를 return
    }

    checkNick().catch( (error) => {
        console.log(error)
    })
      
}  
    // fetch("http://localhost:8080/member/exist/nickname/" + txtNickname.value)
    //     .then((response) => {
    //         return response.text()
    //     })
    //     .then( (data) => {
    //         console.log(data);
    //         if(data==='true'){
    //             divExistNickname.innerHTML = "다른 사용자가 사용중인 nickname입니다"
    //         } else{
    //             divExistNickname.innerHTML = "사용할 수 있는 nickname 입니다"

    //         }
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //     });
    // };

txtNickname.addEventListener('input', checkExistNickname);








