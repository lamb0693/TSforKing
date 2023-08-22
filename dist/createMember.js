const btnCheckExistId = document.getElementById("btnCheckExistId");
if (btnCheckExistId == null)
    console.log("****** Error : btnCheckExistId : null ******");
const checkExistId = () => {
    fetch("http://localhost:8080/member/exist/mar189@naver.com")
        .then((result) => {
        console.log(result);
        const data = result.json();
    })
        .then((data) => {
        console.log(data);
    })
        .catch((error) => {
        console.log(error);
    });
};
btnCheckExistId.addEventListener('click', checkExistId);
