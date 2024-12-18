// store/context/userContext.js
import React, { createContext, useState } from "react";

export const UserContext = createContext({
  token: "",
  setToken: () => {},
  userInfo: {},
  setUserInfo: () => {},
  API_BASE_URL: "",
  defaultRegion: {},
});

function UserContextProvider({ children }) {
  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [defaultRegion] = useState({
    // 중앙대학교 좌표
    latitude: 37.504555,
    longitude: 126.95695,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  });
  // 환경 변수에서 API_BASE_URL 가져오기
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  return (
    <UserContext.Provider
      value={{
        token,
        setToken,
        userInfo,
        setUserInfo,
        API_BASE_URL,
        defaultRegion,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;
