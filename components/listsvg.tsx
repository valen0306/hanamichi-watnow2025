import HomeIcon from "../assets/icons/home-2-svgrepo-com.svg";

/**
 * 2. ReactComponentとしてSVGインポートする場合
 * =>  width や height は、変更できる。
 * => color は、変更できない。
 */
const SvgHome = () => {
  return (
    <img src="../assets/icons/home-2-svgrepo-com.svg" alt="Home" width={50} height={50} style={{ height: "70px" }} />
  );
};

// 指定したx, y座標（px）にSVGを絶対配置して表示する関数
import React from "react";

interface SvgPositionProps {
  x: number;
  y: number;
  size?: number;
}

const SvgHomePositioned: React.FC<SvgPositionProps> = ({ x, y, size = 50 }) => {
  return (
    <img
      src="/assets/icons/home-2-svgrepo-com.svg"
      alt="Home"
      width={size}
      height={size}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        pointerEvents: "none"
      }}
    />
  );
};

export default SvgHomePositioned;
