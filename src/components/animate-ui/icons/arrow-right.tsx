"use client";

import { motion, type Variants } from "motion/react";
import { getVariants, useAnimateIconContext, IconWrapper, type IconProps } from "@/components/animate-ui/icons/icon";

type ArrowRightProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { x: 0, transition: { ease: "easeInOut", duration: 0.3 } },
      animate: { x: "25%", transition: { ease: "easeInOut", duration: 0.3 } },
    },
    path1: {},
    path2: {},
  },
  pointing: {
    group: {},
    path1: {
      initial: { d: "M5 12h14", transition: { ease: "easeInOut", duration: 0.3 } },
      animate: { d: "M5 12h10", transition: { ease: "easeInOut", duration: 0.3 } },
    },
    path2: {
      initial: { d: "m12 5 7 7-7 7", transition: { ease: "easeInOut", duration: 0.3 } },
      animate: { d: "m8 5 7 7-7 7", transition: { ease: "easeInOut", duration: 0.3 } },
    },
  },
} as const satisfies Record<string, Record<string, Variants>>;

function IconComponent({ size, ...props }: ArrowRightProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path d="M5 12h14" variants={variants.path1} initial="initial" animate={controls} />
        <motion.path d="m12 5 7 7-7 7" variants={variants.path2} initial="initial" animate={controls} />
      </motion.g>
    </motion.svg>
  );
}

export function ArrowRight(props: ArrowRightProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
