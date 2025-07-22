// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { toast } from "@/hooks/use-toast";

const firebaseConfig = {
  apiKey: "AIzaSyDLsPlp7xsvYHNoyFOMZfwX2Id4FULgork",
  authDomain: "hydrotrack-45kx7.firebaseapp.com",
  projectId: "hydrotrack-45kx7",
  storageBucket: "hydrotrack-45kx7.firebasestorage.app",
  messagingSenderId: "987443348709",
  appId: "1:987443348709:web:2fba225e23680b4c0c800c",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const messaging = (
    typeof window !== "undefined" ? getMessaging(app) : null
);

export const getMessagingToken = async () => {
    if (!messaging) return;

    try {
        const token = await getToken(messaging, {
            vapidKey: "YOUR_VAPID_KEY_HERE", // Replace with your VAPID key
        });
        
        if(token) {
            console.log("FCM Token: ", token);
            // You can send this token to your server here
            return token;
        } else {
            console.log("No registration token available. Request permission to generate one.");
            return null;
        }

    } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
        return null;
    }
};

// Handle incoming messages. This will be triggered when the app is in the foreground.
if (messaging) {
  onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
    toast({
        title: payload.notification?.title,
        description: payload.notification?.body,
    })
  });
}

export { app, messaging };
