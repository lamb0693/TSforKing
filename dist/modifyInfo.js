const btnWithdraw = document.getElementById("btnWithdraw");
if (btnWithdraw == null)
    console.log("error --- btnWidraw is null");
const formWithdraw = document.getElementById("withdrawForm");
if (formWithdraw == null)
    console.log("error --- formWithdraw is null");
const withdraw = (event) => {
    event.preventDefault();
    if (confirm("정말 탈퇴하시겠습니까?") === true) {
        formWithdraw.submit();
    }
    else {
        return;
    }
};
btnWithdraw.addEventListener("click", withdraw);
