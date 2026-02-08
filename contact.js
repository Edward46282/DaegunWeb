const scriptURL = 'https://script.google.com/macros/s/AKfycby3IamU2X_71jqvFKaTYzezjVPfH34Qi63qbuRMiEF9_re0gn11qxHQqXHh1pkS21mB/exec';
const form = document.querySelector('form');
const notification = document.getElementById('custom-notification');

function showNotification(message, isError = false) {
    notification.innerText = message;
    
    notification.className = 'notification show'; 
    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.add('success');
    }

    setTimeout(function() {
        notification.className = 'notification'; 
    }, 3000);
}

if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();

        const btn = form.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = '보내는 중...';
        btn.disabled = true;

        fetch(scriptURL, { method: 'POST', body: new FormData(form) })
            .then(response => response.json())
            .then(response => {
                if (response.result === 'success') {
                    showNotification('성공적으로 메시지가 전송되었습니다!'); 
                    form.reset();
                } else {
                    showNotification('전송 실패: ' + response.error, true); 
                }
                btn.innerText = originalText;
                btn.disabled = false;
            })
            .catch(error => {
                showNotification('에러 발생! ' + error.message, true); 
                btn.innerText = originalText;
                btn.disabled = false;
            });
    });
}