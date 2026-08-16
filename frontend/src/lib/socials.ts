import { Mail } from "lucide-react";
import { Codolio, Github, Leetcode, Linkedin } from "@/components/BrandIcons";
import { site } from "@/data/site";

/**
 * The social row, defined once and shared by the hero and the contact
 * section. Order is deliberate: code first, then professional, then
 * practice profiles, then email as the direct line.
 */
export const socialLinks = [
  { href: site.socials.github, icon: Github, label: "GitHub" },
  { href: site.socials.linkedin, icon: Linkedin, label: "LinkedIn" },
  { href: site.socials.leetcode, icon: Leetcode, label: "LeetCode" },
  { href: site.socials.codolio, icon: Codolio, label: "Codolio" },
  { href: `mailto:${site.email}`, icon: Mail, label: "Email" },
].filter((s) => s.href);
