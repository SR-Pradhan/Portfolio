import { Codolio, Github, Gmail, Leetcode, Linkedin } from "@/components/BrandIcons";
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
  { href: `mailto:${site.email}`, icon: Gmail, label: "Email" },
].filter((s) => s.href);

/**
 * Whether a link should open in a new tab.
 *
 * `mailto:` and `tel:` must not. The browser opens the blank tab first and only
 * then hands the address to a mail or dialler app, so if none is registered the
 * visitor is left on an empty page wondering what happened. Handing them to the
 * current tab lets the browser swallow them invisibly.
 */
export const opensInNewTab = (href: string) => /^https?:/i.test(href);
