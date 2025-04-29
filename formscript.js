// Form state management
const formState = {
    currentLayer: 1,
    totalLayers: 5,
    cooldownTime: 15, // seconds
    cooldownInterval: null,
    canProceed: true,
    recaptchaExecuted: false,
    recaptchaToken: null
};

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initRecaptcha();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && formState.canProceed) {
            const activeLayer = document.querySelector('.layer.active');
            const currentLayerNum = parseInt(activeLayer.id.replace('layer', ''));
            
            if (currentLayerNum < formState.totalLayers) {
                if (currentLayerNum === 2) {
                    verifyBeforeProceeding(currentLayerNum);
                } else {
                    nextLayer(currentLayerNum);
                }
            }
        }
    });
}

// Initialize reCAPTCHA
function initRecaptcha() {
    grecaptcha.ready(function() {
        grecaptcha.execute('6LfflygrAAAAAIfZhYRK-8gKtA6wZF2D1B1R04mh', {action: 'submit'})
            .then(function(token) {
                formState.recaptchaToken = token;
                formState.recaptchaExecuted = true;
                document.getElementById('recaptcha-container').style.display = 'none';
            })
            .catch(function(error) {
                console.error('reCAPTCHA error:', error);
                setTimeout(() => {
                    formState.recaptchaExecuted = true;
                    document.getElementById('recaptcha-container').style.display = 'none';
                }, 3000);
            });
    });
}

// Verify before proceeding to layer 2
function verifyBeforeProceeding(layerNumber) {
    if (!formState.canProceed) return;
    
    if (layerNumber === 2 && !formState.recaptchaExecuted) {
        document.getElementById('recaptcha-container').style.display = 'block';
        document.getElementById('recaptcha-error').style.display = 'block';
        
        if (!formState.recaptchaToken) {
            initRecaptcha();
        }
        return;
    }
    
    nextLayer(layerNumber);
}

// Proceed to next layer
function nextLayer(layerNumber) {
    if (!formState.canProceed) return;
    
    if (formState.cooldownInterval) {
        clearInterval(formState.cooldownInterval);
    }
    
    document.getElementById(`layer${layerNumber}`).classList.remove('active');
    
    formState.currentLayer = layerNumber + 1;
    document.getElementById(`layer${formState.currentLayer}`).classList.add('active');
    
    updateProgress();
    
    if (formState.currentLayer < formState.totalLayers) {
        startCooldown(formState.currentLayer);
    }
    
    document.getElementById(`layer${formState.currentLayer}`).scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
    
    document.getElementById('recaptcha-error').style.display = 'none';
}

// Start cooldown timer
function startCooldown(layerNumber) {
    formState.canProceed = false;
    let timeLeft = formState.cooldownTime;
    const timerElement = document.getElementById(`timer${layerNumber}`);
    
    const buttons = document.querySelectorAll('.next-btn');
    buttons.forEach(button => {
        button.disabled = true;
        button.classList.add('disabled');
    });
    
    if (timerElement) {
        timerElement.textContent = `Please wait ${timeLeft} seconds before proceeding`;
    }
    
    formState.cooldownInterval = setInterval(() => {
        timeLeft--;
        
        if (timerElement) {
            timerElement.textContent = timeLeft > 0 
                ? `Please wait ${timeLeft} seconds before proceeding`
                : '';
        }
        
        if (timeLeft <= 0) {
            clearInterval(formState.cooldownInterval);
            formState.canProceed = true;
            
            buttons.forEach(button => {
                button.disabled = false;
                button.classList.remove('disabled');
            });
        }
    }, 1000);
}

// Update progress bar
function updateProgress() {
    const progress = (formState.currentLayer / formState.totalLayers) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
}
