/**
 * Play notification chime sound (/sounds/notification.wav)
 */
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.wav');
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policy or user interaction restriction
        console.warn('Notification audio play prevented by browser:', err);
      });
    }
  } catch (err) {
    console.error('Error playing notification sound:', err);
  }
};
