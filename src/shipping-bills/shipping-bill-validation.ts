import { s } from 'core/form'
import { ShippingBillFormValues } from './model'

function requiredText(message: string) {
  return s.string().refine((value) => (value.trim() ? undefined : message))
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function requiredDate(label: string) {
  return s.string().refine((value) => {
    if (!value.trim()) return `${label} is required`
    return isValidDate(value) ? undefined : `Enter a valid ${label.toLowerCase()}`
  })
}

function optionalDate(label: string) {
  return s
    .string()
    .optional()
    .refine((value) => (!value.trim() || isValidDate(value) ? undefined : `Enter a valid ${label.toLowerCase()}`))
}

function isPositiveNumber(value: string) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0
}

const positiveNumber = s
  .string()
  .refine((value) => (isPositiveNumber(value) ? undefined : 'Enter a number greater than zero'))

function isOptionalNonNegativeNumber(value?: string) {
  if (value == null || value.trim() === '') return true
  const number = Number(value)
  return Number.isFinite(number) && number >= 0
}

function isOptionalNonNegativeInteger(value?: string) {
  if (!isOptionalNonNegativeNumber(value)) return false
  return value == null || value.trim() === '' || Number.isInteger(Number(value))
}

function optionalNonNegativeNumber(label: string) {
  return s
    .string()
    .optional()
    .refine((value) => {
      return isOptionalNonNegativeNumber(value) ? undefined : `${label} cannot be negative`
    })
}

function optionalNonNegativeInteger(label: string) {
  return s
    .string()
    .optional()
    .refine((value) =>
      isOptionalNonNegativeInteger(value) ? undefined : `${label} must be a whole number of zero or more`
    )
}

export const shippingBillSchema = s.object({
  jobNumber: s.string().optional(),
  jobDate: requiredDate('Job date'),
  exporterId: requiredText('Select an exporter'),
  exporterBranchId: requiredText('Select an exporter branch'),
  consigneeId: requiredText('Select a consignee'),
  consigneeBranchId: requiredText('Select a consignee branch'),
  loadingPort: requiredText('Select a port of loading'),
  finalDestinationPort: requiredText('Select a final destination port'),
  dischargePort: s.string().optional(),
  originStateCode: s.string().optional(),
  nfeiCategory: s.string().optional(),
  rbiWaiverNumber: s.string().optional(),
  rbiWaiverDate: optionalDate('RBI waiver date'),
  sealType: s.string().optional(),
  numberOfContainers: optionalNonNegativeInteger('Number of containers'),
  natureOfCargo: s.string().optional(),
  grossWeight: optionalNonNegativeNumber('Gross weight'),
  netWeight: optionalNonNegativeNumber('Net weight'),
  measurementUnit: s.string().optional(),
  totalPackages: optionalNonNegativeInteger('Total packages'),
  marksAndNumbers: s.string().optional(),
  loosePackets: optionalNonNegativeInteger('Loose packets'),
  mawbNumber: s.string().optional(),
  hawbNumber: s.string().optional(),
  invoiceNumber: requiredText('Invoice number is required'),
  invoiceDate: requiredDate('Invoice date'),
  currency: requiredText('Select an invoice currency'),
  invoiceTotal: optionalNonNegativeNumber('Invoice total'),
  contractType: requiredText('Select a contract type'),
  buyerId: s.string().optional(),
  buyerBranchId: s.string().optional(),
  thirdPartyId: s.string().optional(),
  thirdPartyBranchId: s.string().optional(),
  ritcCode: requiredText('RITC / HS code is required'),
  goodsDescription1: requiredText('Goods description is required'),
  quantity: positiveNumber,
  unitOfMeasurement: requiredText('Select a unit of measurement'),
  unitPrice: positiveNumber,
  freightRate: optionalNonNegativeNumber('Freight rate'),
  freightAmount: optionalNonNegativeNumber('Freight amount'),
  insuranceRate: optionalNonNegativeNumber('Insurance rate'),
  insuranceAmount: optionalNonNegativeNumber('Insurance amount'),
  commissionRate: optionalNonNegativeNumber('Commission rate'),
  commissionAmount: optionalNonNegativeNumber('Commission amount'),
  discountRate: optionalNonNegativeNumber('Discount rate'),
  discountAmount: optionalNonNegativeNumber('Discount amount'),
  otherDeductionsRate: optionalNonNegativeNumber('Other deductions rate'),
  otherDeductionsAmount: optionalNonNegativeNumber('Other deductions amount'),
  packingCharges: optionalNonNegativeNumber('Packing charges'),
  periodOfPayment: optionalNonNegativeInteger('Payment period'),
  containerNumber: s.string().optional(),
  packingNumberFrom: optionalNonNegativeInteger('Package range start'),
  packingNumberTo: optionalNonNegativeInteger('Package range end'),
  documentTypeCode: s.string().optional(),
  documentReferenceNumber: s.string().optional(),
  registrationNumber: s.string().optional()
})

export function validateShippingBillRelationships(values: ShippingBillFormValues): string[] {
  const errors: string[] = []
  const grossWeight = Number(values.grossWeight)
  const netWeight = Number(values.netWeight)

  if (values.grossWeight?.trim() && values.netWeight?.trim() && netWeight > grossWeight) {
    errors.push('Net weight cannot exceed gross weight.')
  }

  values.packingRanges.forEach((range, index) => {
    const hasStart = range.packingNumberFrom.trim() !== ''
    const hasEnd = range.packingNumberTo.trim() !== ''
    if (hasStart !== hasEnd) {
      errors.push(`Packing range ${index + 1} needs both a start and end package number.`)
    } else if (hasStart && Number(range.packingNumberTo) < Number(range.packingNumberFrom)) {
      errors.push(`Packing range ${index + 1} end must be greater than or equal to its start.`)
    }
  })

  values.containers.forEach((container, index) => {
    if (!container.containerNumber.trim()) errors.push(`Container ${index + 1} needs a container number.`)
  })

  values.licenses.forEach((license, index) => {
    if (!license.registrationNumber.trim()) errors.push(`Licence ${index + 1} needs a registration number.`)
  })

  const hasWaiverNumber = Boolean(values.rbiWaiverNumber?.trim())
  const hasWaiverDate = Boolean(values.rbiWaiverDate?.trim())
  if (hasWaiverNumber !== hasWaiverDate) {
    errors.push('Enter both the RBI waiver number and date, or leave both blank.')
  }

  return errors
}

export function validateShippingBillSubmission(values: ShippingBillFormValues): string[] {
  const errors: string[] = []
  const requiredFields: [string | undefined, string][] = [
    [values.jobDate, 'Job date is required.'],
    [values.exporterId, 'Select an exporter.'],
    [values.exporterBranchId, 'Select an exporter branch.'],
    [values.consigneeId, 'Select a consignee.'],
    [values.consigneeBranchId, 'Select a consignee branch.'],
    [values.loadingPort, 'Select a port of loading.'],
    [values.finalDestinationPort, 'Select a final destination port.']
  ]

  requiredFields.forEach(([value, message]) => {
    if (!value?.trim()) errors.push(message)
  })

  if (values.jobDate.trim() && !isValidDate(values.jobDate)) errors.push('Enter a valid job date.')
  if (values.rbiWaiverDate?.trim() && !isValidDate(values.rbiWaiverDate)) errors.push('Enter a valid RBI waiver date.')
  if (!isOptionalNonNegativeNumber(values.grossWeight)) errors.push('Gross weight cannot be negative.')
  if (!isOptionalNonNegativeNumber(values.netWeight)) errors.push('Net weight cannot be negative.')
  if (!isOptionalNonNegativeInteger(values.numberOfContainers))
    errors.push('Number of containers must be a whole number.')
  if (!isOptionalNonNegativeInteger(values.totalPackages)) errors.push('Total packages must be a whole number.')
  if (!isOptionalNonNegativeInteger(values.loosePackets)) errors.push('Loose packets must be a whole number.')

  if (values.invoices.length === 0) {
    errors.push('Add at least one invoice.')
  }

  values.invoices.forEach((invoice, invoiceIndex) => {
    const label = `Invoice ${invoiceIndex + 1}`
    if (!invoice.invoiceNumber.trim()) errors.push(`${label} number is required.`)
    if (!invoice.invoiceDate.trim() || !isValidDate(invoice.invoiceDate)) errors.push(`${label} needs a valid date.`)
    if (!invoice.currency.trim()) errors.push(`${label} needs a currency.`)
    if (!invoice.contractType.trim()) errors.push(`${label} needs a contract type.`)
    if (!isOptionalNonNegativeNumber(invoice.invoiceTotal)) errors.push(`${label} total cannot be negative.`)
    if (invoice.items.length === 0) errors.push(`${label} needs at least one goods item.`)

    invoice.items.forEach((item, itemIndex) => {
      const itemLabel = `${label}, item ${itemIndex + 1}`
      if (!item.ritcCode.trim()) errors.push(`${itemLabel} needs an RITC / HS code.`)
      if (!item.goodsDescription1.trim()) errors.push(`${itemLabel} needs a goods description.`)
      if (!isPositiveNumber(item.quantity)) errors.push(`${itemLabel} quantity must be greater than zero.`)
      if (!item.unitOfMeasurement.trim()) errors.push(`${itemLabel} needs a unit of measurement.`)
      if (!isPositiveNumber(item.unitPrice)) errors.push(`${itemLabel} unit price must be greater than zero.`)
      if (!isOptionalNonNegativeNumber(item.presentMarketValue)) {
        errors.push(`${itemLabel} market value cannot be negative.`)
      }
    })
  })

  errors.push(...validateShippingBillRelationships(values))
  return errors
}
