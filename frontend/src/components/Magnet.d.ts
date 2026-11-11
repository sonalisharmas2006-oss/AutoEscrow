import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from "react";

export interface MagnetProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  maxOffset?: number;
  exclusive?: boolean;
  axis?: "both" | "x" | "y";
  tilt?: number;
  scale?: number;
  spring?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
  onActiveChange?: (active: boolean) => void;
  wrapperClassName?: string;
  innerClassName?: string;
  style?: CSSProperties;
}

declare function Magnet(props: MagnetProps): ReactElement;

export default Magnet;
