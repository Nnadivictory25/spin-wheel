const canvas = document.getElementById('spinWheel');
const ctx = canvas.getContext('2d');

const sections = [
    { name: 'TRY AGAIN', weight: 25 },      // Reduced from 30
    { name: 'QUIZ 10 USDC', weight: 3 },
    { name: '5 USDC', weight: 5 },
    { name: '1 SUI', weight: 4 },
    { name: 'NOTHING', weight: 20 },        // Reduced from 25
    { name: 'FOOD', weight: 10 },           // Reduced from 12
    { name: 'SNACK', weight: 8 },           // Reduced from 10
    { name: 'MERCH', weight: 6 },
    { name: '2K AIRTIME', weight: 3 },
    { name: '5000 NAIRA', weight: 1 },
    { name: '1 WATER', weight: 10 }         // Increased from 1 to 10
];

// Extract section names for display
const sectionNames = sections.map(section => section.name);
const colors = [
    '#4DA2FF', '#6BB3FF', '#1A8CFF', '#3D9FFF', '#5CADFF',
    '#0A7AFF', '#2F96FF', '#4AA1FF', '#75B8FF', '#1E8EFF', '#38A0FF'
];

const wheelRadius = canvas.width / 2;
const arcSize = (2 * Math.PI) / sectionNames.length;
let currentAngle = 0;
let spinSpeed = 0;
let isSpinning = false;

// Draw the initial wheel
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let startAngle = currentAngle;

    sectionNames.forEach((amount, index) => {
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

    // Disable spin button while spinning
    const spinButton = document.querySelector('.spin-button');
    spinButton.disabled = true;
    spinButton.style.opacity = '0.6';
    spinButton.style.cursor = 'not-allowed';

    // Pre-determine the weighted result
    const predeterminedResult = getWeightedRandomResult();
    const targetIndex = sectionNames.indexOf(predeterminedResult);

    // Calculate initial parameters for natural deceleration to target
    const extraSpins = Math.floor(Math.random() * 3 + 3) * 2 * Math.PI; // 3-6 full rotations
    const targetAngle = -(targetIndex * arcSize) - (arcSize / 2); // Target section center
    const totalRotation = extraSpins + (targetAngle - (currentAngle % (2 * Math.PI)));

    // Calculate realistic physics for smooth deceleration
    const spinDuration = Math.random() * 4000 + 6000; // 6-10 seconds
    const totalFrames = spinDuration / 20; // 20ms per frame
    let frame = 0;

    console.log(`🎯 Target: ${predeterminedResult} (index: ${targetIndex})`);

    const startAngle = currentAngle;
    const endAngle = startAngle + totalRotation;

    playTicklingSound();

    const spinInterval = setInterval(() => {
        frame++;

        // Simple ease-out (starts fast, gradually slows)
        const progress = frame / totalFrames;
        const easeOut = 1 - Math.pow(1 - progress, 2); // Quadratic ease-out (less aggressive than cubic)

        // Calculate current angle based on easing
        currentAngle = startAngle + (totalRotation * easeOut);

        // Calculate current speed for sound synchronization
        const prevProgress = Math.max(0, (frame - 1) / totalFrames);
        const prevEaseOut = 1 - Math.pow(1 - prevProgress, 2);
        const currentSpeed = (easeOut - prevEaseOut) * totalRotation * 50; // Convert to approximate degrees/sec

        // Update sound speed to match current speed
        if (spinSound) {
            const speedRatio = currentSpeed / (totalRotation * 0.02); // Normalize
            const playbackRate = Math.max(0.3, Math.min(1.5, 0.3 + speedRatio * 1.2));
            spinSound.playbackRate = playbackRate;
        }

        if (frame >= totalFrames) {
            // Natural stop at exact target
            currentAngle = endAngle;

            clearInterval(spinInterval);
            isSpinning = false;
            stopTicklingSound();

            // Re-enable spin button
            const spinButton = document.querySelector('.spin-button');
            if (!localStorage.getItem('spinResult')) { // Only re-enable if user hasn't won yet
                spinButton.disabled = false;
                spinButton.style.opacity = '1';
                spinButton.style.cursor = 'pointer';
            }

            // Add delay before showing result
            setTimeout(() => {
                showResult(predeterminedResult);
            }, 800);
        }

        drawWheel();
    }, 20);
}

let spinSound;

// Weighted random selection function
function getWeightedRandomResult() {
    const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0);
    let randomNum = Math.random() * totalWeight;

    for (let i = 0; i < sections.length; i++) {
        randomNum -= sections[i].weight;
        if (randomNum <= 0) {
            return sections[i].name;
        }
    }

    // Fallback (should never reach here)
    return sections[0].name;
}

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
function showResult(predeterminedResult = null) {
    // Use predetermined result or fallback to weighted selection
    const winningAmount = predeterminedResult || getWeightedRandomResult();

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

    // Check result type and show appropriate message
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
    } else if (winningAmount === 'NOTHING') {
        Swal.fire({
            title: '😔 Hard Luck!',
            text: 'Better luck next time!',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#4DA2FF',
            backdrop: false,
            allowOutsideClick: false,
            customClass: {
                container: 'no-backdrop'
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
