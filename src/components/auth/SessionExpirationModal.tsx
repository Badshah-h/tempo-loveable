import React, { useState, useEffect, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/auth/useAuth";
import { tokenService } from "@/services/auth";

// How many seconds before expiration to show the warning
const WARNING_THRESHOLD = 5 * 60; // 5 minutes
const CHECK_INTERVAL = 30000; // Check every 30 seconds
const COUNTDOWN_INTERVAL = 1000; // Update countdown every second

const SessionExpirationModal = () => {
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const { refreshAuth, logout } = useAuth();

  // Check token expiration - extracted as a memoized function
  const checkTokenExpiration = useCallback(() => {
    // Get token and check if it exists
    const token = tokenService.getToken();
    if (!token) return false;

    // Decode the token to get expiration
    const decoded = tokenService.decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    // Calculate time until expiration in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;

    // If within warning threshold, show dialog
    if (timeUntilExpiry > 0 && timeUntilExpiry <= WARNING_THRESHOLD) {
      setSecondsLeft(timeUntilExpiry);
      setOpen(true);
      return true;
    } else if (timeUntilExpiry <= 0) {
      // Token already expired
      logout();
      return false;
    }
    return false;
  }, [logout]);

  // Set up the main expiration check interval
  useEffect(() => {
    // Initial check
    checkTokenExpiration();

    // Set up interval to check token expiration
    const intervalId = setInterval(checkTokenExpiration, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [checkTokenExpiration]);

  // Separate effect for countdown timer when modal is open
  useEffect(() => {
    let countdownId: NodeJS.Timeout;

    if (open && secondsLeft > 0) {
      countdownId = setInterval(() => {
        setSecondsLeft((prev) => {
          const newValue = Math.max(0, prev - 1);
          if (newValue === 0) {
            logout();
            setOpen(false);
          }
          return newValue;
        });
      }, COUNTDOWN_INTERVAL);
    }

    return () => {
      if (countdownId) clearInterval(countdownId);
    };
  }, [open, secondsLeft, logout]);

  const handleExtend = async () => {
    try {
      await refreshAuth();
      setOpen(false);
    } catch (error) {
      console.error("Failed to refresh authentication:", error);
      // If refresh fails, logout as a fallback
      logout();
    }
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  // Format seconds into mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your session is about to expire</AlertDialogTitle>
          <AlertDialogDescription>
            For security reasons, your session will expire in{" "}
            {formatTime(secondsLeft)}. Do you want to extend your session?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLogout}>Logout</AlertDialogCancel>
          <AlertDialogAction onClick={handleExtend}>
            Stay logged in
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionExpirationModal;
