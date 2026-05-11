export const getStartTime = (isCompleted?: boolean, lastTime?: number) => {
  if (isCompleted) return 0;
  return lastTime || 0;
};

export const shouldMarkComplete = (
  alreadyCompleted?: boolean,
  progress?: number,
) => {
  if (alreadyCompleted) return true;
  return (progress || 0) >= 90;
};
