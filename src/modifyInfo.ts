import { SERVER_IP } from "./serverUrl";

// 탈퇴
const btnWithdraw : HTMLButtonElement = document.getElementById("btnWithdraw") as HTMLButtonElement | null
if(btnWithdraw == null) console.log("error --- btnWidraw is null")

const formWithdraw : HTMLFormElement = document.getElementById("withdrawForm") as HTMLFormElement | null;
if(formWithdraw == null) console.log("error --- formWithdraw is null")

const withdraw = (event : MouseEvent) => {
    event.preventDefault();

    if( confirm("정말 탈퇴하시겠습니까?") === true ){
        formWithdraw.submit();
    } else {
        return;
    }
} 

btnWithdraw.addEventListener("click", withdraw)

// 패스워드 변경

const btnChangePassword : HTMLButtonElement = document.getElementById("btnChangePassword") as HTMLButtonElement | null
if(btnChangePassword == null) console.log("error --- btnChangePassword is null")

const changePassword = (event : MouseEvent) => {
    event.preventDefault();
    const txtPassword1 : HTMLInputElement = document.getElementById("txtPassword1") as HTMLInputElement | null
    if(txtPassword1 == null) console.log("error --- txtPassword1 is null")
    const txtPassword2 : HTMLInputElement = document.getElementById("txtPassword2") as HTMLInputElement | null
    if(txtPassword2 == null) console.log("error --- txtPassword2 is null")   
    
    const changePasswordForm : HTMLFormElement = document.getElementById("changePasswordForm") as HTMLFormElement | null;
    if(changePasswordForm == null) alert("error --- changePasswordForm is null")
    
    if(txtPassword1.value.length < 8){
        alert("패스워드1 : 8자리 이상이 필요합니다 ");
        return;    
    } else if(txtPassword2.value.length < 8) {
        alert("패스워드2 : 8자리 이상이 필요합니다 ");
    } else  if(txtPassword1.value != txtPassword2.value) {
        alert("두 개의 패스워드가 일치하지 않습니다");
        return;
    }
    
    changePasswordForm.submit()
    
}

btnChangePassword.addEventListener("click", changePassword)

// nickname 변경

const btnChangeNick : HTMLButtonElement = document.getElementById("btnChangeNick") as HTMLButtonElement | null
if(btnChangeNick == null) console.log("error --- btnChangeNick is null")

const txtNickname : HTMLInputElement = document.getElementById("txtNickname") as HTMLInputElement | null
if(txtNickname == null) console.log("error --- txtNickname is null")

const changeNick = (event : MouseEvent) => {
    event.preventDefault();

    const changeNickForm : HTMLFormElement = document.getElementById("changeNickForm") as HTMLFormElement | null;
    if(changeNickForm == null) alert("error --- changeNickForm is null")
    
    if(txtNickname.value.length < 3){
        alert("닉네임 : 3자리 이상이 필요합니다 ");
        return;    
    }
    
    changeNickForm.submit()  
}

btnChangeNick.addEventListener("click", changeNick)

const divExistNickname : HTMLDivElement = document.getElementById("divExistNickname") as HTMLDivElement | null
if (divExistNickname == null) console.log("****** Error : divExistNickname : null ******");

const checkExistNick = (event : InputEvent) => {
    event.preventDefault();

    if(txtNickname.value.length<3) {
        divExistNickname.innerHTML = "사용할 수 없는 Nickname입니다"
        return
    }

    const resultPromise = fetch("http://" + SERVER_IP + "/member/exist/nickname/" + txtNickname.value)
    
    const dataPromise  = resultPromise.then( (res) => {
        //throw new Error("My Error")
        return res.text();
    })

    const errorPromise = dataPromise.then((result) =>{
        console.log(result);
        if(result==='true') divExistNickname.innerHTML = "다른 사용자가 사용중인 nickname 입니다"
        else divExistNickname.innerHTML = "사용할 수 있는 nickname 입니다"  
    })
      
    errorPromise.catch( (err) => {
        console.log(err);
    })
} 

txtNickname.addEventListener('input', checkExistNick);



