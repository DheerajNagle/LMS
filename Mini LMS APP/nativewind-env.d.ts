/// <reference types="nativewind/types" />

declare module "lucide-react-native" {
  import { ComponentType } from "react";
  
  export interface LucideProps {
    size?: number | string;
    color?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    className?: string;
    style?: any;
    onPress?: () => void;
  }

  export const X: ComponentType<LucideProps>;
  export const Award: ComponentType<LucideProps>;
  export const Flame: ComponentType<LucideProps>;
  export const WifiOff: ComponentType<LucideProps>;
  export const ArrowLeft: ComponentType<LucideProps>;
  export const Clock: ComponentType<LucideProps>;
  export const Star: ComponentType<LucideProps>;
  export const Users: ComponentType<LucideProps>;
  export const CheckCircle2: ComponentType<LucideProps>;
  export const Play: ComponentType<LucideProps>;
  export const Bookmark: ComponentType<LucideProps>;
  export const GraduationCap: ComponentType<LucideProps>;
  export const Compass: ComponentType<LucideProps>;
  export const BookOpen: ComponentType<LucideProps>;
  export const Search: ComponentType<LucideProps>;
  export const User: ComponentType<LucideProps>;
  export const ChevronRight: ComponentType<LucideProps>;
  export const LogOut: ComponentType<LucideProps>;
  export const Sun: ComponentType<LucideProps>;
  export const Moon: ComponentType<LucideProps>;
  export const Wifi: ComponentType<LucideProps>;
  export const CloudLightning: ComponentType<LucideProps>;
  export const RefreshCw: ComponentType<LucideProps>;
  export const Layers: ComponentType<LucideProps>;
  export const Sparkles: ComponentType<LucideProps>;
  export const Mail: ComponentType<LucideProps>;
  export const Lock: ComponentType<LucideProps>;
  export const AlertCircle: ComponentType<LucideProps>;
  export const Eye: ComponentType<LucideProps>;
  export const EyeOff: ComponentType<LucideProps>;
  export const AlertTriangle: ComponentType<LucideProps>;
  export const Pause: ComponentType<LucideProps>;
  export const SkipForward: ComponentType<LucideProps>;
  export const Maximize: ComponentType<LucideProps>;
  export const RotateCcw: ComponentType<LucideProps>;
  export const Volume2: ComponentType<LucideProps>;
  export const VolumeX: ComponentType<LucideProps>;
  export const CheckCircle: ComponentType<LucideProps>;
}
