/**
 * request.ts — Server-side request configuration & granular modular message loader
 * Syailendra Group ERP
 */

import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import enAuthLogin from '@/messages/en/auth/login.json'
import enCommon from '@/messages/en/common/common.json'
import enNav from '@/messages/en/common/nav.json'
import enCrmOverview from '@/messages/en/crm/overview.json'
import enHrisDepartments from '@/messages/en/hris/departments.json'
import enHrisEmployees from '@/messages/en/hris/employees.json'
import enHrisOverview from '@/messages/en/hris/overview.json'
import enMainOverview from '@/messages/en/main/overview.json'
import enCompany from '@/messages/en/others/company.json'
import enCountries from '@/messages/en/others/countries.json'
import enDistricts from '@/messages/en/others/districts.json'
import enOthersOverview from '@/messages/en/others/overview.json'
import enPartners from '@/messages/en/others/partners.json'
import enProvinces from '@/messages/en/others/provinces.json'
import enRegencies from '@/messages/en/others/regencies.json'
import enRegionalCommon from '@/messages/en/others/regional-common.json'
import enRoles from '@/messages/en/others/roles.json'
import enVillages from '@/messages/en/others/villages.json'
import enScmDemo from '@/messages/en/scm/demo.json'
import enTraceDistillers from '@/messages/en/scm/distillers.json'
import enTraceFarmers from '@/messages/en/scm/farmers.json'
import enHarvest from '@/messages/en/scm/harvest.json'
import enMaterials from '@/messages/en/scm/materials.json'
import enTraceOverview from '@/messages/en/scm/overview.json'
import enPublicTrace from '@/messages/en/scm/public-trace.json'
import enSupplierCategories from '@/messages/en/scm/supplier-categories.json'
import enSuppliers from '@/messages/en/scm/suppliers.json'
import enInventory from '@/messages/en/wms/inventory.json'
import enWmsOverview from '@/messages/en/wms/overview.json'
import idAuthLogin from '@/messages/id/auth/login.json'
import idCommon from '@/messages/id/common/common.json'
import idNav from '@/messages/id/common/nav.json'
import idCrmOverview from '@/messages/id/crm/overview.json'
import idHrisDepartments from '@/messages/id/hris/departments.json'
import idHrisEmployees from '@/messages/id/hris/employees.json'
import idHrisOverview from '@/messages/id/hris/overview.json'
import idMainOverview from '@/messages/id/main/overview.json'
import idCompany from '@/messages/id/others/company.json'
import idCountries from '@/messages/id/others/countries.json'
import idDistricts from '@/messages/id/others/districts.json'
import idOthersOverview from '@/messages/id/others/overview.json'
import idPartners from '@/messages/id/others/partners.json'
import idProvinces from '@/messages/id/others/provinces.json'
import idRegencies from '@/messages/id/others/regencies.json'
import idRegionalCommon from '@/messages/id/others/regional-common.json'
import idRoles from '@/messages/id/others/roles.json'
import idVillages from '@/messages/id/others/villages.json'
import idScmDemo from '@/messages/id/scm/demo.json'
import idTraceDistillers from '@/messages/id/scm/distillers.json'
import idTraceFarmers from '@/messages/id/scm/farmers.json'
import idHarvest from '@/messages/id/scm/harvest.json'
import idMaterials from '@/messages/id/scm/materials.json'
import idTraceOverview from '@/messages/id/scm/overview.json'
import idPublicTrace from '@/messages/id/scm/public-trace.json'
import idSupplierCategories from '@/messages/id/scm/supplier-categories.json'
import idSuppliers from '@/messages/id/scm/suppliers.json'
import idInventory from '@/messages/id/wms/inventory.json'
import idWmsOverview from '@/messages/id/wms/overview.json'

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
