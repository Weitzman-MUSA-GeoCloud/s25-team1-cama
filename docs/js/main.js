// main.js
import { loadAssessorsMode } from './assessors.js';
import { loadOwnersMode } from './owners.js';

// Function to check for mobile devices
function checkMobileDevice() {
    const width = window.innerWidth;

    // Check if the device is mobile (less than 768px for mobile, 768px to 1024px for tablets)
    if (width < 768) {
        alert("You are viewing this page on mobile. The interface is best used on tablets / laptops / desktops. Better for your eyes!");
    }
}

window.onload = checkMobileDevice;

// Open links in new tab for external links
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', event => {
      window.open(link.href, '_blank');
    });
  });

// Toggle view panel visibility
const toggleBtn = document.getElementById('toggle-view-panel');
const viewOptions = document.getElementById('view-options');
let isMinimized = false;

toggleBtn.addEventListener('click', () => {
    isMinimized = !isMinimized;
    viewOptions.style.display = isMinimized ? 'none' : 'block';
    toggleBtn.innerHTML = isMinimized 
        ? '<i class="bi bi-plus"></i>'  // Plus icon when collapsed
        : '<i class="bi bi-dash"></i>'; // Dash icon when expanded
    toggleBtn.title = isMinimized ? 'Expand' : 'Minimize';
});

document.getElementById('assessor-btn').addEventListener('click', () => {
    loadAssessorsMode();
});
document.getElementById('owner-btn').addEventListener('click', () => {
    loadOwnersMode();
});

const bell = document.getElementById('bell-image');

const dingDongPermutations = [
'ding dong',
'dong ding',
'ding ding dong',
'ding dong ding',
'dong ding ding',
'ding ding ding dong',
'ding dong dong ding',
'dong dong ding ding',
'dong ding dong ding',
'ding dong dong',
'dong dong ding',
'ding ding dong dong',
'dong ding ding dong',
'ding dong ding dong',
'ding ding dong ding',
'dong ding dong',
'ding dong ding ding',
'dong ding dong dong',
'ding dong dong dong',
'ding ding ding dong dong',
'dong dong dong ding',
'ding dong ding ding dong',
'dong dong ding ding ding',
'ding ding dong dong ding',
'ding dong ding dong ding',
'dong ding ding',
'ding ding',
'dong dong',
'ding dong DING DONG',
'ding... dong...',
'ding-a-dong',
'dingding dongdong',
'dong-ding!',
'ding & dong',
'ding → dong → ding',
'ding, dong, ding!',
'dingity dong',
'ding-dong-ding-dong',
'DONG ding dong DING',
'di-dong-ding-dong'
];

bell.addEventListener('click', () => {
const randomPhrase = dingDongPermutations[Math.floor(Math.random() * dingDongPermutations.length)];
alert(randomPhrase);
});