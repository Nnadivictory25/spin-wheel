const canvas = document.getElementById('spinWheel');
const ctx = canvas.getContext('2d');

const sections = [
    'TRY AGAIN',
    'QUIZ 10 USDC',
    '5 USDC',
    '1 SUI',
    'NOTHING',
    'FOOD',
    'SNACK',
    'MERCH',
    'AIRTIME',
    '5000 NAIRA',
    '1 WATER'
];
const colors = [
    '#4DA2FF', '#6BB3FF', '#1A8CFF', '#3D9FFF', '#5CADFF',
    '#0A7AFF', '#2F96FF', '#4AA1FF', '#75B8FF', '#1E8EFF', '#38A0FF'
];

const wheelRadius = canvas.width / 2;
const arcSize = (2 * Math.PI) / sections.length;
let currentAngle = 0;
let spinSpeed = 0;
let isSpinning = false;

// Draw the initial wheel
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let startAngle = currentAngle;

    sections.forEach((amount, index) => {
        const endAngle = startAngle + arcSize;

        // Draw slice
        ctx.beginPath();
        ctx.moveTo(wheelRadius, wheelRadius);
        ctx.arc(wheelRadius, wheelRadius, wheelRadius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index];
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.stroke();

        // Add text inside the section
        ctx.save();
        ctx.translate(wheelRadius, wheelRadius);
        ctx.rotate(startAngle + arcSize / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(amount, wheelRadius / 1.6, 5);
        ctx.restore();

        startAngle = endAngle;
    });
}

// Spin the wheel
function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    const initialSpinSpeed = Math.random() * 10 + 20; // Initial spin speed
    spinSpeed = initialSpinSpeed;
    const spinDuration = Math.random() * 5000 + 5000; // Spin time: 5-10 seconds
    const deceleration = spinSpeed / (spinDuration / 20); // Gradual slowdown per frame

    playTicklingSound();

    const spinInterval = setInterval(() => {
        currentAngle += spinSpeed * Math.PI / 180; // Convert degrees to radians
        spinSpeed -= deceleration;

        // Update sound speed to match spin speed
        updateSoundSpeed(spinSpeed, initialSpinSpeed);

        if (spinSpeed <= 0) {
            clearInterval(spinInterval);
            isSpinning = false;
            showResult();
            stopTicklingSound(); // Stop sound when spin ends
        }

        drawWheel();
    }, 20);
}

let spinSound;

// Play tickling sound
function playTicklingSound() {
    try {
        spinSound = new Audio('./spin.mp3');
        spinSound.loop = true;
        spinSound.playbackRate = 1.0; // Normal speed initially
        spinSound.play().catch(e => console.log('🔊 Audio play error:', e));
    } catch (error) {
        console.log('🔊 Audio error:', error);
    }
}

// Update sound speed based on spin speed
function updateSoundSpeed(currentSpinSpeed, initialSpinSpeed) {
    if (spinSound) {
        // Calculate playback rate: ranges from 0.3 (slow) to 1.5 (fast)
        const speedRatio = currentSpinSpeed / initialSpinSpeed;
        const playbackRate = Math.max(0.3, Math.min(1.5, 0.3 + speedRatio * 1.2));
        spinSound.playbackRate = playbackRate;
    }
}

// Stop tickling sound
function stopTicklingSound() {
    if (spinSound) {
        spinSound.pause();
        spinSound.currentTime = 0;
    }
}

// Show the result using SweetAlert
function showResult() {
    const finalAngle = currentAngle % (2 * Math.PI);
    const winningIndex = Math.floor((sections.length - (finalAngle / (2 * Math.PI) * sections.length)) % sections.length);
    const winningAmount = sections[winningIndex];

    console.log(`🎉 Spin result: ${winningAmount}`);

    // Save result to localStorage (except for TRY AGAIN)
    if (winningAmount !== 'TRY AGAIN') {
        saveResult(winningAmount);

        // Disable further spins
        const spinButton = document.querySelector('.spin-button');
        spinButton.disabled = true;
        spinButton.textContent = 'Already Spun!';
        spinButton.style.opacity = '0.6';
        spinButton.style.cursor = 'not-allowed';
    }

    // Check if result is "TRY AGAIN"
    if (winningAmount === 'TRY AGAIN') {
        Swal.fire({
            title: '🔄 Try Again!',
            text: 'Better luck this time! Give it another spin!',
            icon: 'info',
            confirmButtonText: 'Spin Again!',
            confirmButtonColor: '#4DA2FF',
            backdrop: false,
            allowOutsideClick: false,
            customClass: {
                container: 'no-backdrop'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                setTimeout(() => {
                    spinWheel();
                }, 500);
            }
        });
    } else {
        Swal.fire({
            title: '🎉 Congratulations!',
            text: `You won: ${winningAmount}`,
            icon: 'success',
            confirmButtonText: 'Awesome!',
            confirmButtonColor: '#4DA2FF',
            backdrop: false,
            allowOutsideClick: false,
            customClass: {
                container: 'no-backdrop'
            }
        });
    }
}

// Check if user has already spun
function checkPreviousResult() {
    const previousResult = localStorage.getItem('spinResult');
    if (previousResult) {
        console.log('🎯 Previous result found:', previousResult);

        // Disable spin button and show result
        const spinButton = document.querySelector('.spin-button');
        spinButton.disabled = true;
        spinButton.textContent = 'Already Spun!';
        spinButton.style.opacity = '0.6';
        spinButton.style.cursor = 'not-allowed';

        // Show what they won
        Swal.fire({
            title: '🎯 You Already Spun!',
            text: `You won: ${previousResult}`,
            icon: 'info',
            confirmButtonText: 'OK',
            confirmButtonColor: '#4DA2FF',
            backdrop: false,
            allowOutsideClick: false,
            customClass: {
                container: 'no-backdrop'
            }
        });

        return true;
    }
    return false;
}

// Save result to localStorage
function saveResult(result) {
    localStorage.setItem('spinResult', result);
    console.log('💾 Result saved to localStorage:', result);
}

// Clear result from localStorage (demo function)
function clearResult() {
    localStorage.removeItem('spinResult');
    console.log('🧹 localStorage cleared!');

    // Re-enable spin button
    const spinButton = document.querySelector('.spin-button');
    spinButton.disabled = false;
    spinButton.textContent = 'Spin';
    spinButton.style.opacity = '1';
    spinButton.style.cursor = 'pointer';

    Swal.fire({
        title: '🧹 Cleared!',
        text: 'You can spin again now!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#4DA2FF',
        timer: 2000,
        backdrop: false,
        allowOutsideClick: false,
        customClass: {
            container: 'no-backdrop'
        }
    });
}

// Initialize the wheel
drawWheel();
checkPreviousResult();
