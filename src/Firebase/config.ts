import { initializeApp,cert  } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const firebaseConfigString = process.env.FIREBASE_CONFIG;
if (!firebaseConfigString) {
    throw new Error("FIREBASE_CONFIG not found in .env");
}
const firebaseConfig = JSON.parse(firebaseConfigString);


initializeApp({
    credential: cert(firebaseConfig)
});


// const registrationToken = 'dF_GmsHVgHLxgkConwYJQW:APA91bHqDOzjcNyd3oDWHm_N8RchIvS9GkhjT0nOVNIsoRfmMn10NCeKuiUnyWgFDA_dawucmGUBOhj0f4yTMocHBLbDgNlpYEh9AMRXRoYvq6A_KHkdZLc'; 

// const message = {
//     notification: {
//       title: '📢 Hello từ Node.js!',
//       body: 'Đây là thông báo từ server gửi đến React app.',
//     },
//     data: {
//       type: 'NEW_MESSAGE', 
//       customId: '12345',
//     },
//     token: registrationToken,
// };

// getMessaging()
//   .send(message)
//   .then((response) => {
//     console.log('✅ Notification đã gửi:', response);
//   })
//   .catch((error) => {
//     console.error('❌ Gửi lỗi:', error);
// });