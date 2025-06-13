import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "./firebase";

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error("Error signing out: ", error);
    return false;
  }
};
