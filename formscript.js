let currentLayer = 1;
        const cooldownTime = 15; // 15 seconds cooldown
        let cooldownInterval;
        let canProceed = true;
        let recaptchaExecuted = false;

        // Initialize reCAPTCHA
        function initRecaptcha() {
            grecaptcha.ready(function() {
                grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'}).then(function(token) {
                    document.getElementById('recaptcha-container').style.display = 'none';
                    recaptchaExecuted = true;
                });
            });
        }

        // Special verification for layer 2
        function verifyBeforeProceeding(layerNumber) {
            if (!canProceed) return;
            
            if (layerNumber === 2 && !recaptchaExecuted) {
                // Show reCAPTCHA and error message
                document.getElementById('recaptcha-container').style.display = 'block';
                document.getElementById('recaptcha-error').style.display = 'block';
                initRecaptcha();
                return;
            }
            
            // If verification passed or not needed, proceed normally
            nextLayer(layerNumber);
        }

        function nextLayer(layerNumber) {
            if (!canProceed) return;
            
            // Hide current layer
            document.getElementById(`layer${layerNumber}`).classList.remove('active');
            
            // Show next layer
            currentLayer = layerNumber + 1;
            document.getElementById(`layer${currentLayer}`).classList.add('active');
            
            // Update progress bar
            updateProgress();
            
            // Start cooldown timer
            startCooldown(currentLayer);
            
            // Scroll to top of new layer
            document.getElementById(`layer${currentLayer}`).scrollTop = 0;
            
            // Hide any reCAPTCHA error messages
            document.getElementById('recaptcha-error').style.display = 'none';
        }

        function startCooldown(layerNumber) {
            canProceed = false;
            let timeLeft = cooldownTime;
            const timerElement = document.getElementById(`timer${layerNumber}`);
            
            // Disable next button during cooldown
            const buttons = document.querySelectorAll(`#layer${layerNumber} .next-btn`);
            buttons.forEach(button => {
                button.disabled = true;
            });
            
            if (timerElement) {
                timerElement.textContent = `Please wait ${timeLeft} seconds before proceeding`;
            }
            
            cooldownInterval = setInterval(() => {
                timeLeft--;
                if (timerElement) {
                    timerElement.textContent = `Please wait ${timeLeft} seconds before proceeding`;
                }
                
                if (timeLeft <= 0) {
                    clearInterval(cooldownInterval);
                    if (timerElement) {
                        timerElement.textContent = '';
                    }
                    canProceed = true;
                    
                    // Re-enable next button
                    buttons.forEach(button => {
                        button.disabled = false;
                    });
                }
            }, 1000);
        }

        function updateProgress() {
            const progress = (currentLayer / 5) * 100;
            document.getElementById('progress').style.width = `${progress}%`;
        }