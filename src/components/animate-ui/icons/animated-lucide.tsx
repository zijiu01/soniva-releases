"use client";

import { motion, type Variants } from "motion/react";
import { getVariants, IconWrapper, type IconProps, useAnimateIconContext } from "@/components/animate-ui/icons/icon";
import { __iconData as arrowDownData } from "lucide-react/dist/esm/icons/arrow-down.mjs";
import { __iconData as arrowUpData } from "lucide-react/dist/esm/icons/arrow-up.mjs";
import { __iconData as checkData } from "lucide-react/dist/esm/icons/check.mjs";
import { __iconData as globeData } from "lucide-react/dist/esm/icons/globe.mjs";
import { __iconData as headphonesData } from "lucide-react/dist/esm/icons/headphones.mjs";
import { __iconData as keyRoundData } from "lucide-react/dist/esm/icons/key-round.mjs";
import { __iconData as languagesData } from "lucide-react/dist/esm/icons/languages.mjs";
import { __iconData as layersData } from "lucide-react/dist/esm/icons/layers.mjs";
import { __iconData as menuData } from "lucide-react/dist/esm/icons/menu.mjs";
import { __iconData as moonData } from "lucide-react/dist/esm/icons/moon.mjs";
import { __iconData as slidersData } from "lucide-react/dist/esm/icons/sliders-horizontal.mjs";
import { __iconData as sparklesData } from "lucide-react/dist/esm/icons/sparkles.mjs";
import { __iconData as sunData } from "lucide-react/dist/esm/icons/sun.mjs";
import { __iconData as sunMoonData } from "lucide-react/dist/esm/icons/sun-moon.mjs";
import { __iconData as walletCardsData } from "lucide-react/dist/esm/icons/wallet-cards.mjs";

export type AnimatedIconName =
  | "ArrowDown"
  | "ArrowUp"
  | "Check"
  | "Globe"
  | "Headphones"
  | "KeyRound"
  | "Languages"
  | "Layers3"
  | "Menu"
  | "Moon"
  | "SlidersHorizontal"
  | "Sparkles"
  | "Sun"
  | "SunMoon"
  | "WalletCards";

type AnimatedLucideProps = Omit<IconProps<keyof typeof animations>, "name"> & { name: AnimatedIconName };

const animations = {
  default: {
    path: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.55, ease: "easeInOut", staggerChildren: 0.06 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

const motionElements = {
  circle: motion.circle,
  ellipse: motion.ellipse,
  line: motion.line,
  path: motion.path,
  polygon: motion.polygon,
  polyline: motion.polyline,
  rect: motion.rect,
} as const;

type IconNode = [keyof typeof motionElements, Record<string, string | number>][];

const iconNodes: Record<AnimatedIconName, IconNode> = {
  ArrowDown: arrowDownData.node as IconNode,
  ArrowUp: arrowUpData.node as IconNode,
  Check: checkData.node as IconNode,
  Globe: globeData.node as IconNode,
  Headphones: headphonesData.node as IconNode,
  KeyRound: keyRoundData.node as IconNode,
  Languages: languagesData.node as IconNode,
  Layers3: layersData.node as IconNode,
  Menu: menuData.node as IconNode,
  Moon: moonData.node as IconNode,
  SlidersHorizontal: slidersData.node as IconNode,
  Sparkles: sparklesData.node as IconNode,
  Sun: sunData.node as IconNode,
  SunMoon: sunMoonData.node as IconNode,
  WalletCards: walletCardsData.node as IconNode,
};

function createAnimatedIcon(name: AnimatedIconName) {
  return function AnimatedIcon({ size, ...props }: IconProps<keyof typeof animations>) {
    const { controls } = useAnimateIconContext();
    const variants = getVariants(animations);
    const nodes = iconNodes[name];
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
        {nodes.map(([tag, attributes], index) => {
          const Element = motionElements[tag];
          const { key: _key, ...nodeAttributes } = attributes;
          return (
            <Element key={index} {...nodeAttributes} variants={variants.path} initial="initial" animate={controls} />
          );
        })}
      </motion.svg>
    );
  };
}

const animatedIconNames: AnimatedIconName[] = [
  "ArrowDown",
  "ArrowUp",
  "Check",
  "Globe",
  "Headphones",
  "KeyRound",
  "Languages",
  "Layers3",
  "Menu",
  "Moon",
  "SlidersHorizontal",
  "Sparkles",
  "Sun",
  "SunMoon",
  "WalletCards",
];

const animatedIcons = Object.fromEntries(animatedIconNames.map((name) => [name, createAnimatedIcon(name)])) as Record<
  AnimatedIconName,
  ReturnType<typeof createAnimatedIcon>
>;

export function AnimatedLucide({ name, ...props }: AnimatedLucideProps) {
  return <IconWrapper icon={animatedIcons[name]} {...props} />;
}
