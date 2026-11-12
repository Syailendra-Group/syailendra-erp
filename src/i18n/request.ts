/**
 * request.ts — Server-side request configuration & granular modular message loader
 * Syailendra Group ERP
 */

import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import enAiOverview from '@/messages/en/sammend/ai/overview.json'
import enAuthLogin from '@/messages/en/auth/login.json'
import enCommon from '@/messages/en/common/common.json'
import enNav from '@/messages/en/common/nav.json'
import enCrmOverview from '@/messages/en/sammend/crm/overview.json'
import enDcmOverview from '@/messages/en/sammend/dcm/overview.json'
import enFtmOverview from '@/messages/en/sbi/ftm/overview.json'
import enHrisDepartments from '@/messages/en/sbi/hrm/departments.json'
import enHrisEmployees from '@/messages/en/sbi/hrm/employees.json'
import enHrisOverview from '@/messages/en/sbi/hrm/overview.json'
import enImmOverview from '@/messages/en/sg/imm/overview.json'
import enMainOverview from '@/messages/en/sbi/main/overview.json'
import enCompany from '@/messages/en/sbi/others/company.json'
import enCountries from '@/messages/en/sbi/others/countries.json'
import enDistricts from '@/messages/en/sbi/others/districts.json'
import enOthersOverview from '@/messages/en/sbi/others/overview.json'
import enPartners from '@/messages/en/sbi/others/partners.json'
import enProvinces from '@/messages/en/sbi/others/provinces.json'
import enRegencies from '@/messages/en/sbi/others/regencies.json'
import enRegionalCommon from '@/messages/en/sbi/others/regional-common.json'
import enRoles from '@/messages/en/sbi/others/roles.json'
import enVillages from '@/messages/en/sbi/others/villages.json'
import enScmDemo from '@/messages/en/sbi/scm/demo.json'
import enTraceDistillers from '@/messages/en/sbi/scm/distillers.json'
import enTraceFarmers from '@/messages/en/sbi/scm/farmers.json'
import enHarvest from '@/messages/en/sbi/scm/harvest.json'
import enMaterials from '@/messages/en/sbi/scm/materials.json'
import enTraceOverview from '@/messages/en/sbi/scm/overview.json'
import enPublicTrace from '@/messages/en/sbi/scm/public-trace.json'
import enSupplierCategories from '@/messages/en/sbi/scm/supplier-categories.json'
import enSuppliers from '@/messages/en/sbi/scm/suppliers.json'
import enInventory from '@/messages/en/spba/wms/inventory.json'
import enWmsOverview from '@/messages/en/spba/wms/overview.json'
import idAiOverview from '@/messages/id/sammend/ai/overview.json'
import idAuthLogin from '@/messages/id/auth/login.json'
import idCommon from '@/messages/id/common/common.json'
import idNav from '@/messages/id/common/nav.json'
import idCrmOverview from '@/messages/id/sammend/crm/overview.json'
import idDcmOverview from '@/messages/id/sammend/dcm/overview.json'
import idFtmOverview from '@/messages/id/sbi/ftm/overview.json'
import idHrisDepartments from '@/messages/id/sbi/hrm/departments.json'
import idHrisEmployees from '@/messages/id/sbi/hrm/employees.json'
import idHrisOverview from '@/messages/id/sbi/hrm/overview.json'
import idImmOverview from '@/messages/id/sg/imm/overview.json'
import idMainOverview from '@/messages/id/sbi/main/overview.json'
import idCompany from '@/messages/id/sbi/others/company.json'
import idCountries from '@/messages/id/sbi/others/countries.json'
import idDistricts from '@/messages/id/sbi/others/districts.json'
import idOthersOverview from '@/messages/id/sbi/others/overview.json'
import idPartners from '@/messages/id/sbi/others/partners.json'
import idProvinces from '@/messages/id/sbi/others/provinces.json'
import idRegencies from '@/messages/id/sbi/others/regencies.json'
import idRegionalCommon from '@/messages/id/sbi/others/regional-common.json'
import idRoles from '@/messages/id/sbi/others/roles.json'
import idVillages from '@/messages/id/sbi/others/villages.json'
import idScmDemo from '@/messages/id/sbi/scm/demo.json'
import idTraceDistillers from '@/messages/id/sbi/scm/distillers.json'
import idTraceFarmers from '@/messages/id/sbi/scm/farmers.json'
import idHarvest from '@/messages/id/sbi/scm/harvest.json'
import idMaterials from '@/messages/id/sbi/scm/materials.json'
import idTraceOverview from '@/messages/id/sbi/scm/overview.json'
import idPublicTrace from '@/messages/id/sbi/scm/public-trace.json'
import idSupplierCategories from '@/messages/id/sbi/scm/supplier-categories.json'
import idSuppliers from '@/messages/id/sbi/scm/suppliers.json'
import idInventory from '@/messages/id/spba/wms/inventory.json'
import idWmsOverview from '@/messages/id/spba/wms/overview.json'

import { routing } from './routing'

const messagesMap = {
  id: {
    common: idCommon,
    nav: idNav,
    auth: idAuthLogin,
    inventory: idInventory,
    main: { overview: idMainOverview },
    wms: { inventory: idInventory, overview: idWmsOverview },
    crm: { overview: idCrmOverview },
    ftm: { overview: idFtmOverview },
    dcm: { overview: idDcmOverview },
    ai: { overview: idAiOverview },
    imm: { overview: idImmOverview },
    scm: {
      overview: idTraceOverview,
      farmers: idTraceFarmers,
      distillers: idTraceDistillers,
      publicTrace: idPublicTrace,
      materials: idMaterials,
      supplierCategories: idSupplierCategories,
      suppliers: idSuppliers,
      harvest: idHarvest,
      demo: idScmDemo
    },
    traceability: {
      overview: idTraceOverview,
      farmers: idTraceFarmers,
      distillers: idTraceDistillers,
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
    inventory: enInventory,
    main: { overview: enMainOverview },
    wms: { inventory: enInventory, overview: enWmsOverview },
    crm: { overview: enCrmOverview },
    ftm: { overview: enFtmOverview },
    dcm: { overview: enDcmOverview },
    ai: { overview: enAiOverview },
    imm: { overview: enImmOverview },
    scm: {
      overview: enTraceOverview,
      farmers: enTraceFarmers,
      distillers: enTraceDistillers,
      publicTrace: enPublicTrace,
      materials: enMaterials,
      supplierCategories: enSupplierCategories,
      suppliers: enSuppliers,
      harvest: enHarvest,
      demo: enScmDemo
    },
    traceability: {
      overview: enTraceOverview,
      farmers: enTraceFarmers,
      distillers: enTraceDistillers,
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
