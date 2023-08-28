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
const btnChangePassword = document.getElementById("btnChangePassword");
if (btnChangePassword == null)
    console.log("error --- btnChangePassword is null");
const changePassword = (event) => {
    const txtPassword1 = document.getElementById("txtPassword1");
    if (txtPassword1 == null)
        console.log("error --- txtPassword1 is null");
    const txtPassword2 = document.getElementById("txtPassword2");
    if (txtPassword2 == null)
        console.log("error --- txtPassword2 is null");
    const changePasswordForm = document.getElementById("changePasswordForm");
    if (changePasswordForm == null)
        alert("error --- changePasswordForm is null");
    if (txtPassword1.value.length < 8) {
        alert("패스워드1 : 8자리 이상이 필요합니다 ");
        return;
    }
    else if (txtPassword2.value.length < 8) {
        alert("패스워드2 : 8자리 이상이 필요합니다 ");
    }
    else if (txtPassword1.value != txtPassword2.value) {
        alert("두 개의 패스워드가 일치하지 않습니다");
        return;
    }
    changePasswordForm.submit();
};
btnChangePassword.addEventListener("click", changePassword);
