// Generate a short unique queue code (8 chars, alphanumeric, URL-safe)
export function generateQueueCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Build the public ticket URL from a queue code
export function buildQueueUrl(queueCode) {
  return `${window.location.origin}/q/${queueCode}`;
}

// Calculate estimated wait time
export function calcEstimatedWait(peopleAhead, timePerPersonMinutes) {
  const totalMin = peopleAhead * timePerPersonMinutes;
  if (totalMin < 1) return 'Less than 1 min';
  if (totalMin < 60) return `~${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `~${h}h ${m}min` : `~${h}h`;
}

// Get status color class
export function getStatusColor(status) {
  switch (status) {
    case 'active': return 'badge-active';
    case 'completed': return 'badge-inactive';
    case 'serving': return 'badge-serving';
    case 'hold': return 'badge-hold';
    case 'waiting': return 'badge-inactive';
    default: return 'badge-inactive';
  }
}

// Format relative time
export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Request browser notification permission and send notification
export async function sendBrowserNotification(title, body, icon = '/icon-192.png') {
  if (!('Notification' in window)) return;
  
  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  
  if (permission === 'granted') {
    new Notification(title, { body, icon, badge: icon });
  }
}
