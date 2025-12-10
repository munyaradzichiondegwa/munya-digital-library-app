// src/services/auth.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { toast } from "react-toastify";

export async function signUp(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      createdAt: new Date().toISOString()
    });

    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);
    if (snap.size > 1) throw new Error("Username already taken.");

    toast.success("Account created successfully!");
    return user;
  } catch (err) {
    if (err.code === "auth/email-already-in-use") toast.error("Email already in use.");
    else if (err.code === "auth/weak-password") toast.error("Password too weak.");
    else toast.error(err.message || "Sign-up failed.");
    throw err;
  }
}

export async function logInWithUsername(username, password) {
  try {
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error("Username not found.");

    const email = snap.docs[0].data().email;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    toast.success("Logged in successfully!");
    return userCredential.user;
  } catch (err) {
    if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found")
      toast.error("Invalid username or password.");
    else toast.error(err.message || "Login failed.");
    throw err;
  }
}

export function logOut() {
  return signOut(auth)
    .then(() => toast.info("Logged out successfully."))
    .catch(err => toast.error("Logout failed: " + err.message));
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}
