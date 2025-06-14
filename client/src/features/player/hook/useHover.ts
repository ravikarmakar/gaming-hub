import { useState } from "react";

export const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  return {
    isHovered,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
};
