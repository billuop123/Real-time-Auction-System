import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: string;
}

export function useInfo() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const jwt = sessionStorage.getItem("jwt");
    if (jwt) {
      const decodedToken = jwtDecode<DecodedToken>(jwt);
      console.log(decodedToken);
      const { userId } = decodedToken;
      setUserId(userId);
    }
    setIsReady(true);
  }, []);

  return isReady ? userId : null;
}
export function useIsLoggedIn() {}
