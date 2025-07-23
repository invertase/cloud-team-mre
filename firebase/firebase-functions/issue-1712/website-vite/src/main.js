import './style.css'
import { triggerAppRemoveEvent } from './firebase.js'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1>🚀 Firebase Analytics Test</h1>
    
    <div id="status" class="status">
      <strong>Status:</strong> Initializing Firebase...
    </div>
    
    <div class="status">
      <strong>Instructions:</strong>
      <ul>
        <li>This page will automatically trigger the "app_remove" analytics event when loaded</li>
        <li>You can also manually trigger the event using the button below</li>
        <li>Check the Firebase Functions logs to see the event being processed</li>
      </ul>
    </div>
    
    <div class="button-container">
      <button id="triggerBtn" class="trigger-btn">
        Trigger App Remove Event
      </button>
      <button id="clearLogBtn" class="clear-btn">
        Clear Log
      </button>
    </div>
    
    <div class="log" id="log">
      <div>Log will appear here...</div>
    </div>
  </div>
`

// Get DOM elements
const statusDiv = document.getElementById('status');
const triggerBtn = document.getElementById('triggerBtn');
const clearLogBtn = document.getElementById('clearLogBtn');
const logDiv = document.getElementById('log');

// Update status function
function updateStatus(message, type = 'info') {
  statusDiv.innerHTML = `<strong>Status:</strong> ${message}`;
  statusDiv.className = `status ${type}`;
}

// Log function
function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  logDiv.innerHTML += `<div>[${timestamp}] ${message}</div>`;
  logDiv.scrollTop = logDiv.scrollHeight;
}

// Clear log function
function clearLog() {
  logDiv.innerHTML = '<div>Log cleared...</div>';
}

// Trigger app_remove event function
function handleTriggerEvent() {
  log('🔄 Triggering app_remove event...');
  const success = triggerAppRemoveEvent();
  
  if (success) {
    updateStatus('App Remove event triggered! Check Firebase Functions logs.', 'success');
    log('✅ Event sent to Firebase Analytics');
    
    // Disable button temporarily to prevent spam
    triggerBtn.disabled = true;
    setTimeout(() => {
      triggerBtn.disabled = false;
    }, 2000);
  } else {
    updateStatus('Error triggering event. Check console for details.', 'error');
    log('❌ Failed to trigger event');
  }
}

// Event listeners
triggerBtn.addEventListener('click', handleTriggerEvent);
clearLogBtn.addEventListener('click', clearLog);

// Initialize and trigger event automatically
updateStatus('Firebase Analytics initialized successfully!', 'success');
log('Firebase Analytics initialized');

// Automatically trigger app_remove event after a short delay
setTimeout(() => {
  log('🔄 Auto-triggering app_remove event...');
  handleTriggerEvent();
}, 1000);
