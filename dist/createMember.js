const txtId = document.getElementById("id");
if (txtId == null)
    console.log("****** Error : txtId : null ******");
const divExistID = document.getElementById("divExistId");
if (divExistID == null)
    console.log("****** Error : divExistID : null ******");
const txtNickname = document.getElementById("nickname");
if (txtNickname == null)
    console.log("****** Error : txtNickname : null ******");
const divExistNickname = document.getElementById("divExistNickname");
if (divExistNickname == null)
    console.log("****** Error : divExistID : null ******");
const checkExistId = (event) => {
    event.preventDefault();
    fetch("http://localhost:8080/member/exist/id/" + txtId.value)
        .then((response) => {
        return response.text();
    })
        .then((data) => {
        console.log(data);
        if (data === 'true') {
            divExistID.innerHTML = "다른 사용자가 사용중인 id 입니다";
        }
        else {
            divExistID.innerHTML = "사용할 수 있는 id 입니다";
        }
    })
        .catch((error) => {
        console.log(error);
    });
};
txtId.addEventListener('input', checkExistId);
const checkExistNickname = (event) => {
    event.preventDefault();
    fetch("http://localhost:8080/member/exist/nickname/" + txtNickname.value)
        .then((response) => {
        return response.text();
    })
        .then((data) => {
        console.log(data);
        if (data === 'true') {
            divExistNickname.innerHTML = "다른 사용자가 사용중인 nickname입니다";
        }
        else {
            divExistNickname.innerHTML = "사용할 수 있는 nickname 입니다";
        }
    })
        .catch((error) => {
        console.log(error);
    });
};
txtNickname.addEventListener('input', checkExistNickname);
