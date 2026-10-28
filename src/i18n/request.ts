/**
 * request.ts — Server-side request configuration & modular message loader
 */

import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

// Import modular json files statically to ensure bundle portability
import idCommon from "@/messages/id/common.json";
import idAuth from "@/messages/id/auth.json";
import idNav from "@/messages/id/nav.json";
import idInventory from "@/messages/id/inventory.json";

import enCommon from "@/messages/en/common.json";
import enAuth from "@/messages/en/auth.json";
import enNav from "@/messages/en/nav.json";
import enInventory from "@/messages/en/inventory.json";

const messagesMap = {
  id: {
    common: idCommon,
    auth: idAuth,
    nav: idNav,
    inventory: idInventory,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    nav: enNav,
    inventory: enInventory,
  },
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: messagesMap[locale as "id" | "en"],
  };
});
