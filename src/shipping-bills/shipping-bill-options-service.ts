import { documentCodes } from '@/data/e-sanchit-codes'
import { quantityCodes } from '@/data/quantity-code'
import schemeCodes from '@/data/scheme-codes'
import { stateOptions } from '@/data/states'
import { Trades } from '@/data/trade-agrements'
import { cargoOptions, contractTypes, paymentTypes, priceInclusionTypes, sealTypes, weightUnits } from '@/data/types'
import { countries, ports } from './model'

const currencyOptions = ['USD', 'EUR', 'INR', 'AED', 'GBP', 'SGD'].map((value) => ({ value, label: value }))

export const shippingBillFormOptions = {
  currencies: currencyOptions,
  ports: ports.map((port) => ({ value: port.code, label: `${port.name} · ${port.code}` })),
  documentCodes,
  quantityCodes,
  schemeCodes,
  stateOptions,
  trades: Trades,
  cargoOptions,
  contractTypes,
  paymentTypes,
  priceInclusionTypes,
  sealTypes,
  weightUnits,
  countries,
  nfeiCategories: [
    { value: '01', label: 'Free trade sample' },
    { value: '02', label: 'Diplomatic goods' },
    { value: '03', label: 'Warranty replacement' },
    { value: '07', label: 'Gift parcel' },
    { value: '08', label: 'Other' }
  ],
  containerSizes: [
    { value: '20', label: '20 ft' },
    { value: '40', label: '40 ft' },
    { value: '45', label: '45 ft' }
  ],
  containerSealTypes: [
    { value: 1, label: 'BTSL - Bottle Seal' },
    { value: 2, label: 'ESEAL - Electronic Seal' },
    { value: 3, label: 'RFID - Radio Frequency Identifier' }
  ],
  igstPaymentStatuses: [
    { value: 'NA', label: 'Not applicable' },
    { value: 'LUT', label: 'Under LUT / bond' },
    { value: 'P', label: 'Against payment' }
  ],
  accessoryStatuses: [
    { value: '0', label: 'No accessory' },
    { value: '1', label: 'Included free of cost' },
    { value: '2', label: 'Entered separately' }
  ],
  fileTypes: [{ value: 'pdf', label: 'PDF' }],
  goodsSources: [
    { value: 'I', label: 'Imported' },
    { value: 'D', label: 'Indigenous' }
  ],
  exporterClasses: [
    { value: 'F', label: 'Manufacturer' },
    { value: 'R', label: 'Merchant' },
    { value: 'C', label: 'Merchant courier' },
    { value: 'D', label: 'Manufacturer courier' }
  ],
  exporterTypes: [
    { value: 'P', label: 'Private' },
    { value: 'G', label: 'Government' },
    { value: 'W', label: 'Warehouse' }
  ]
}

export type ShippingBillFormOptions = typeof shippingBillFormOptions

export const emptyShippingBillFormOptions: ShippingBillFormOptions = {
  currencies: [],
  ports: [],
  documentCodes: [],
  quantityCodes: [],
  schemeCodes: [],
  stateOptions: [],
  trades: [],
  cargoOptions: [],
  contractTypes: [],
  paymentTypes: [],
  priceInclusionTypes: [],
  sealTypes: [],
  weightUnits: [],
  countries: [],
  nfeiCategories: [],
  containerSizes: [],
  containerSealTypes: [],
  igstPaymentStatuses: [],
  accessoryStatuses: [],
  fileTypes: [],
  goodsSources: [],
  exporterClasses: [],
  exporterTypes: []
}

function delay<T>(value: T, milliseconds: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), milliseconds))
}

export function loadShippingBillFormOptions(): Promise<ShippingBillFormOptions> {
  return delay(shippingBillFormOptions, 200)
}
