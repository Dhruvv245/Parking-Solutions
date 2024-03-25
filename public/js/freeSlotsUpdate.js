const socket = io();
socket.on('freeSlotsUpdate', (slots) => {
  if (isNaN(slots)) {
    document.getElementById('freeSlots').innerText = 'Error';
  } else {
    document.getElementById('freeSlots').innerText = slots;
  }
});
