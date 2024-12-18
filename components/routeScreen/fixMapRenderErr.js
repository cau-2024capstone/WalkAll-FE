export const fixMapRenderErr = (setTemporaryPin) => {
  // 지도에 보이지 않는 영역에 임시 핀 추가 (Expo SDK 52 업데이트 후 버그 해결용)
  const tempCoordinate = {
    latitude: 30,
    longitude: 120,
  };
  setTemporaryPin(tempCoordinate);

  // 50ms 후 임시 핀 삭제
  setTimeout(() => {
    setTemporaryPin(null);
  }, 50);
};
