/**
 * request.ts — Server-side request configuration & granular modular message loader
 * Syailendra Group ERP
 */

import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import enAiOverview from '@/messages/en/ai/overview.json'
import enAuthLogin from '@/messages/en/auth/login.json'
import enCommon from '@/messages/en/common/common.json'
import enNav from '@/messages/en/common/nav.json'
import enCrmOverview from '@/messages/en/crm/overview.json'
import enDcmOverview from '@/messages/en/dcm/overview.json'
import enFtmOverview from '@/messages/en/ftm/overview.json'
import enHrisDepartments from '@/messages/en/hrm/departments.json'
import enHrisEmployees from '@/messages/en/hrm/employees.json'
import enHrisOverview from '@/messages/en/hrm/overview.json'
import enImmOverview from '@/messages/en/imm/overview.json'
import enMitraDistiller from '@/messages/en/mitra/distiller.json'
import enMitraFarmer from '@/messages/en/mitra/farmer.json'
import enMitraLanding from '@/messages/en/mitra/landing.json'
import enMitraLogin from '@/messages/en/mitra/login.json'
import enMitraPin from '@/messages/en/mitra/pin.json'
import enMitraShell from '@/messages/en/mitra/shell.json'
import enCompany from '@/messages/en/others/company.json'
import enCountries from '@/messages/en/others/countries.json'
import enDistricts from '@/messages/en/others/districts.json'
import enMenus from '@/messages/en/others/menus.json'
import enOthersOverview from '@/messages/en/others/overview.json'
import enPartners from '@/messages/en/others/partners.json'
import enProvinces from '@/messages/en/others/provinces.json'
import enRegencies from '@/messages/en/others/regencies.json'
import enRegionalCommon from '@/messages/en/others/regional-common.json'
import enRoles from '@/messages/en/others/roles.json'
import enVillages from '@/messages/en/others/villages.json'
import enWebsite from '@/messages/en/others/website.json'
import enScmComingSoon from '@/messages/en/scm/coming-soon.json'
import enScmCommodities from '@/messages/en/scm/commodities.json'
import enScmDemo from '@/messages/en/scm/demo.json'
import enTraceDistilleries from '@/messages/en/scm/distilleries.json'
import enTraceFarmers from '@/messages/en/scm/farmers.json'
import enScmFarms from '@/messages/en/scm/farms.json'
import enHarvest from '@/messages/en/scm/harvest.json'
import enTraceOverview from '@/messages/en/scm/overview.json'
import enProducts from '@/messages/en/scm/products.json'
import enPublicTrace from '@/messages/en/scm/public-trace.json'
import enScmSubmissions from '@/messages/en/scm/submissions.json'
import enSupplierCategories from '@/messages/en/scm/supplier-categories.json'
import enSupplierTypes from '@/messages/en/scm/supplier-types.json'
import enSuppliers from '@/messages/en/scm/suppliers.json'
import enInventory from '@/messages/en/wms/inventory.json'
import enWmsOverview from '@/messages/en/wms/overview.json'
import idAiOverview from '@/messages/id/ai/overview.json'
import idAuthLogin from '@/messages/id/auth/login.json'
import idCommon from '@/messages/id/common/common.json'
import idNav from '@/messages/id/common/nav.json'
import idCrmOverview from '@/messages/id/crm/overview.json'
import idDcmOverview from '@/messages/id/dcm/overview.json'
import idFtmOverview from '@/messages/id/ftm/overview.json'
import idHrisDepartments from '@/messages/id/hrm/departments.json'
import idHrisEmployees from '@/messages/id/hrm/employees.json'
import idHrisOverview from '@/messages/id/hrm/overview.json'
import idImmOverview from '@/messages/id/imm/overview.json'
import idMitraDistiller from '@/messages/id/mitra/distiller.json'
import idMitraFarmer from '@/messages/id/mitra/farmer.json'
import idMitraLanding from '@/messages/id/mitra/landing.json'
import idMitraLogin from '@/messages/id/mitra/login.json'
import idMitraPin from '@/messages/id/mitra/pin.json'
import idMitraShell from '@/messages/id/mitra/shell.json'
import idCompany from '@/messages/id/others/company.json'
import idCountries from '@/messages/id/others/countries.json'
import idDistricts from '@/messages/id/others/districts.json'
import idMenus from '@/messages/id/others/menus.json'
import idOthersOverview from '@/messages/id/others/overview.json'
import idPartners from '@/messages/id/others/partners.json'
import idProvinces from '@/messages/id/others/provinces.json'
import idRegencies from '@/messages/id/others/regencies.json'
import idRegionalCommon from '@/messages/id/others/regional-common.json'
import idRoles from '@/messages/id/others/roles.json'
import idVillages from '@/messages/id/others/villages.json'
import idWebsite from '@/messages/id/others/website.json'
import idScmComingSoon from '@/messages/id/scm/coming-soon.json'
import idScmCommodities from '@/messages/id/scm/commodities.json'
import idScmDemo from '@/messages/id/scm/demo.json'
import idTraceDistilleries from '@/messages/id/scm/distilleries.json'
import idTraceFarmers from '@/messages/id/scm/farmers.json'
import idScmFarms from '@/messages/id/scm/farms.json'
import idHarvest from '@/messages/id/scm/harvest.json'
import idTraceOverview from '@/messages/id/scm/overview.json'
import idProducts from '@/messages/id/scm/products.json'
import idPublicTrace from '@/messages/id/scm/public-trace.json'
import idScmSubmissions from '@/messages/id/scm/submissions.json'
import idSupplierCategories from '@/messages/id/scm/supplier-categories.json'
import idSupplierTypes from '@/messages/id/scm/supplier-types.json'
import idSuppliers from '@/messages/id/scm/suppliers.json'
import idInventory from '@/messages/id/wms/inventory.json'
import idWmsOverview from '@/messages/id/wms/overview.json'

import { routing } from './routing'

const messagesMap = {
  id: {
    common: idCommon,
    nav: idNav,
    auth: idAuthLogin,
    mitra: {
      login: idMitraLogin,
      pin: idMitraPin,
      landing: idMitraLanding,
      shell: idMitraShell,
      farmer: idMitraFarmer,
      distiller: idMitraDistiller
    },
    inventory: idInventory,
    wms: { inventory: idInventory, overview: idWmsOverview },
    crm: { overview: idCrmOverview },
    ftm: { overview: idFtmOverview },
    dcm: { overview: idDcmOverview },
    ai: { overview: idAiOverview },
    imm: { overview: idImmOverview },
    scm: {
      commodities: idScmCommodities,
      farms: idScmFarms,
      overview: idTraceOverview,
      farmers: idTraceFarmers,
      distilleries: idTraceDistilleries,
      publicTrace: idPublicTrace,
      products: idProducts,
      supplierCategories: idSupplierCategories,
      supplierTypes: idSupplierTypes,
      suppliers: idSuppliers,
      harvest: idHarvest,
      demo: idScmDemo,
      comingSoon: idScmComingSoon,
      submissions: idScmSubmissions
    },
    traceability: {
      overview: idTraceOverview,
      farmers: idTraceFarmers,
      distilleries: idTraceDistilleries,
      publicTrace: idPublicTrace
    },
    hris: {
      overview: idHrisOverview,
      employees: idHrisEmployees,
      departments: idHrisDepartments
    },
    admin: {
      overview: idHrisOverview,
      employees: idHrisEmployees,
      departments: idHrisDepartments,
      roles: idRoles,
      company: idCompany,
      contacts: idPartners
    },
    others: {
      overview: idOthersOverview,
      countries: idCountries,
      provinces: idProvinces,
      regencies: idRegencies,
      districts: idDistricts,
      villages: idVillages,
      company: idCompany,
      menus: idMenus,
      website: idWebsite,
      roles: idRoles,
      partners: idPartners
    },
    regional: {
      common: idRegionalCommon,
      regionalToasts: idRegionalCommon.regionalToasts,
      parentAlert: idRegionalCommon.parentAlert,
      foreignForm: idRegionalCommon.foreignForm,
      countries: idCountries,
      provinces: idProvinces,
      regencies: idRegencies,
      districts: idDistricts,
      villages: idVillages
    }
  },
  en: {
    common: enCommon,
    nav: enNav,
    auth: enAuthLogin,
    mitra: {
      login: enMitraLogin,
      pin: enMitraPin,
      landing: enMitraLanding,
      shell: enMitraShell,
      farmer: enMitraFarmer,
      distiller: enMitraDistiller
    },
    inventory: enInventory,
    wms: { inventory: enInventory, overview: enWmsOverview },
    crm: { overview: enCrmOverview },
    ftm: { overview: enFtmOverview },
    dcm: { overview: enDcmOverview },
    ai: { overview: enAiOverview },
    imm: { overview: enImmOverview },
    scm: {
      commodities: enScmCommodities,
      farms: enScmFarms,
      overview: enTraceOverview,
      farmers: enTraceFarmers,
      distilleries: enTraceDistilleries,
      publicTrace: enPublicTrace,
      products: enProducts,
      supplierCategories: enSupplierCategories,
      supplierTypes: enSupplierTypes,
      suppliers: enSuppliers,
      harvest: enHarvest,
      demo: enScmDemo,
      comingSoon: enScmComingSoon,
      submissions: enScmSubmissions
    },
    traceability: {
      overview: enTraceOverview,
      farmers: enTraceFarmers,
      distilleries: enTraceDistilleries,
      publicTrace: enPublicTrace
    },
    hris: {
      overview: enHrisOverview,
      employees: enHrisEmployees,
      departments: enHrisDepartments
    },
    admin: {
      overview: enHrisOverview,
      employees: enHrisEmployees,
      departments: enHrisDepartments,
      roles: enRoles,
      company: enCompany,
      contacts: enPartners
    },
    others: {
      overview: enOthersOverview,
      countries: enCountries,
      provinces: enProvinces,
      regencies: enRegencies,
      districts: enDistricts,
      villages: enVillages,
      company: enCompany,
      menus: enMenus,
      website: enWebsite,
      roles: enRoles,
      partners: enPartners
    },
    regional: {
      common: enRegionalCommon,
      regionalToasts: enRegionalCommon.regionalToasts,
      parentAlert: enRegionalCommon.parentAlert,
      foreignForm: enRegionalCommon.foreignForm,
      countries: enCountries,
      provinces: enProvinces,
      regencies: enRegencies,
      districts: enDistricts,
      villages: enVillages
    }
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: messagesMap[locale as 'id' | 'en']
  }
})
