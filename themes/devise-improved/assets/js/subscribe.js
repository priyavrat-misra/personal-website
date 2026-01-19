(function () {
    const form = document.getElementById('subscription-form');
    const statusDiv = document.getElementById('form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        submitBtn.disabled = true;
        statusDiv.textContent = '';
        statusDiv.className = 'status-message';

        fetch('https://website-backend.p-v.workers.dev/subscribers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('email-input').value,
                referrer: window.location.pathname
            })
        }).then(response => {
            if (response.ok) {
                statusDiv.textContent = 'Thanks for subscribing!';
                form.querySelector('.form-group').style.display = 'none';
            } else {
                statusDiv.textContent = 'Something went wrong. Please try again.';
                submitBtn.disabled = false;
            }
        }).catch(error => {
            console.error('Error:', error);
            statusDiv.textContent = 'Something went wrong. Please try again.';
            submitBtn.disabled = false;
        });
    });
})();
