import React from "react";
import { View, Pressable, ViewProps } from "react-native";
import { clsx } from "clsx";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export default function Card({ children, onPress, className, ...props }: CardProps) {
  const containerClass = clsx(
    "bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft dark:shadow-soft-dark overflow-hidden",
    className
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={containerClass} {...props}>
        {children}
      </Pressable>
    );
  }

  return (
    <View className={containerClass} {...props}>
      {children}
    </View>
  );
}

// Subcomponent: CardHeader
Card.Header = function CardHeader({ children, className, ...props }: ViewProps) {
  return (
    <View 
      className={clsx(
        "px-5 py-4 border-b border-slate-50 dark:border-slate-800/40 flex-row justify-between items-center",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};

// Subcomponent: CardBody
Card.Body = function CardBody({ children, className, ...props }: ViewProps) {
  return (
    <View className={clsx("p-5", className)} {...props}>
      {children}
    </View>
  );
};

// Subcomponent: CardFooter
Card.Footer = function CardFooter({ children, className, ...props }: ViewProps) {
  return (
    <View 
      className={clsx(
        "px-5 py-4 border-t border-slate-50 dark:border-slate-800/40 flex-row justify-between items-center bg-slate-50/50 dark:bg-slate-900/30",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};
