"use client";

import * as React from "react";
import { motion, useAnimation, type SVGMotionProps, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

const staticAnimations = {
  path: {
    initial: { pathLength: 1 },
    animate: { pathLength: [0.05, 1], transition: { duration: 0.8, ease: "easeInOut" } },
  } as Variants,
  "path-loop": {
    initial: { pathLength: 1 },
    animate: { pathLength: [1, 0.05, 1], transition: { duration: 1.6, ease: "easeInOut" } },
  } as Variants,
} as const;

type StaticAnimations = keyof typeof staticAnimations;
type TriggerProp<T = string> = boolean | StaticAnimations | T;

export type DefaultIconProps<T = string> = {
  animate?: TriggerProp<T>;
  animateOnHover?: TriggerProp<T>;
  animateOnTap?: TriggerProp<T>;
  animation?: T | StaticAnimations;
  initialOnAnimateEnd?: boolean;
};

export type IconProps<T> = DefaultIconProps<T> &
  Omit<SVGMotionProps<SVGSVGElement>, "animate"> & { size?: number };

export type IconWrapperProps<T> = IconProps<T> & { icon: React.ComponentType<IconProps<T>> };

type AnimateIconContextValue = {
  controls: ReturnType<typeof useAnimation>;
  animation: string;
  active: boolean;
  initialOnAnimateEnd: boolean;
};

const AnimateIconContext = React.createContext<AnimateIconContextValue | null>(null);

export function useAnimateIconContext(): AnimateIconContextValue {
  const context = React.useContext(AnimateIconContext);
  if (!context) {
    return {
      controls: undefined as unknown as ReturnType<typeof useAnimation>,
      animation: "default",
      active: false,
      initialOnAnimateEnd: false,
    };
  }
  return context;
}

/** 精简版动画图标容器：只保留导航/页脚/主题切换实际用到的触发方式
 *  （animate、hover、tap、initialOnAnimateEnd）。原版 600+ 行的
 *  animateOnView / asChild / loop 状态机本仓库用不到，故不移植。 */
function AnimateIcon({
  animate = false,
  animateOnHover = false,
  animateOnTap = false,
  animation = "default",
  initialOnAnimateEnd = false,
  children,
}: {
  animate?: TriggerProp;
  animateOnHover?: TriggerProp;
  animateOnTap?: TriggerProp;
  animation?: string;
  initialOnAnimateEnd?: boolean;
  children: React.ReactNode;
}) {
  const controls = useAnimation();
  const [active, setActive] = React.useState(false);

  const run = React.useCallback(async () => {
    setActive(true);
    await controls.start("animate");
    if (initialOnAnimateEnd) {
      await controls.start("initial");
      setActive(false);
    }
  }, [controls, initialOnAnimateEnd]);

  const stop = React.useCallback(async () => {
    setActive(false);
    if (!initialOnAnimateEnd) await controls.start("initial");
  }, [controls, initialOnAnimateEnd]);

  React.useEffect(() => {
    if (animate === undefined) return;
    if (animate) void run();
    else void stop();
  }, [animate, run, stop]);

  return (
    <AnimateIconContext.Provider value={{ controls, animation, active, initialOnAnimateEnd }}>
      <span
        className="contents"
        onMouseEnter={animateOnHover ? () => void run() : undefined}
        onMouseLeave={animateOnHover || animateOnTap ? () => void stop() : undefined}
        onPointerDown={animateOnTap ? () => void run() : undefined}
        onPointerUp={animateOnTap ? () => void stop() : undefined}
      >
        {children}
      </span>
    </AnimateIconContext.Provider>
  );
}

const pathClassName = "[&_[stroke-dasharray='1px_1px']]:![stroke-dasharray:1px_0px]";

export function IconWrapper<T extends string>({
  size = 28,
  animation: animationProp,
  animate,
  animateOnHover,
  animateOnTap,
  initialOnAnimateEnd,
  icon: IconComponent,
  className,
  ...props
}: IconWrapperProps<T>) {
  const context = React.useContext(AnimateIconContext);
  const animation = animationProp ?? context?.animation ?? "default";

  if (context) {
    return (
      <IconComponent
        size={size}
        className={cn(className, (animation === "path" || animation === "path-loop") && pathClassName)}
        {...props}
      />
    );
  }

  const hasTrigger =
    animate !== undefined || animateOnHover !== undefined || animateOnTap !== undefined || animationProp !== undefined;

  if (hasTrigger) {
    return (
      <AnimateIcon
        animate={animate}
        animateOnHover={animateOnHover}
        animateOnTap={animateOnTap}
        animation={animationProp}
        initialOnAnimateEnd={initialOnAnimateEnd}
      >
        <IconComponent
          size={size}
          className={cn(className, (animation === "path" || animation === "path-loop") && pathClassName)}
          {...props}
        />
      </AnimateIcon>
    );
  }

  return (
    <IconComponent
      size={size}
      className={cn(className, (animation === "path" || animation === "path-loop") && pathClassName)}
      {...props}
    />
  );
}

export function getVariants<
  V extends { default: T; [key: string]: T },
  T extends Record<string, Variants>,
>(animations: V): T {
  const { animation } = useAnimateIconContext();
  if (animation in staticAnimations) {
    const variant = staticAnimations[animation as StaticAnimations];
    const result = {} as T;
    for (const key in animations.default) {
      if ((animation === "path" || animation === "path-loop") && key.includes("group")) continue;
      result[key] = variant as T[Extract<keyof T, string>];
    }
    return result;
  }
  return (animations[animation as keyof V] as T) ?? animations.default;
}
