const btnWithdraw : HTMLButtonElement = document.getElementById("btnWithdraw") as HTMLButtonElement | null;
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

