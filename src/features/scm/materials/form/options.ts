export function getMaterialOptions(t: (key: string) => string) {
  const categoryOptions = [
    { label: t('categories.essential_oils'), value: 'essential_oils' },
    { label: t('categories.natural_isolates'), value: 'natural_isolates' },
    { label: t('categories.carrier_oils'), value: 'carrier_oils' },
    { label: t('categories.hydrosols'), value: 'hydrosols' },
    { label: t('categories.raw_biomass'), value: 'raw_biomass' },
    { label: t('categories.packaging'), value: 'packaging' }
  ]

  const methodOptions = [
    { label: t('extractionMethods.steam_distillation'), value: 'steam_distillation' },
    { label: t('extractionMethods.hydro_distillation'), value: 'hydro_distillation' },
    { label: t('extractionMethods.cold_pressed'), value: 'cold_pressed' },
    { label: t('extractionMethods.solvent_extraction'), value: 'solvent_extraction' },
    { label: t('extractionMethods.fractional_distillation'), value: 'fractional_distillation' },
    { label: t('extractionMethods.none'), value: 'none' }
  ]

  const aromaOptions = [
    { label: t('aromaNotes.top'), value: 'top' },
    { label: t('aromaNotes.middle'), value: 'middle' },
    { label: t('aromaNotes.base'), value: 'base' },
    { label: t('aromaNotes.fixative'), value: 'fixative' }
  ]

  const trackingOptions = [
    { label: t('trackingOptions.lot'), value: 'lot' },
    { label: t('trackingOptions.serial'), value: 'serial' },
    { label: t('trackingOptions.none'), value: 'none' }
  ]

  const uomOptions = [
    { label: 'Kilogram (kg)', value: '1' },
    { label: 'Gram (g)', value: '14' },
    { label: 'Liter (L)', value: '23' },
    { label: 'Units / Pcs', value: '1' }
  ]

  return {
    categoryOptions,
    methodOptions,
    aromaOptions,
    trackingOptions,
    uomOptions
  }
}
