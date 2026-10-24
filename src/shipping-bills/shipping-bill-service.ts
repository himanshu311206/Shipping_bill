import { getDemoData, saveBill } from './demo-store'
import { emptyBill, SavedBill, ShippingBillFormValues } from './model'
import { validateShippingBillSubmission } from './shipping-bill-validation'

function delay<T>(value: T, milliseconds: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), milliseconds))
}

function valueOrFallback<T extends string | number, F extends string | number>(
  value: T | undefined,
  fallback: F
): T | F {
  if (typeof value === 'string' && value.length === 0) return fallback
  return value ?? fallback
}

export function generateFlatFileContent(bill: SavedBill): string {
  const v = bill.values
  const lines: string[] = []

  lines.push(`HREC**ZZ*${valueOrFallback(v.loadingPort, 'INMUN1')}*ZZ*ICEGATE*01*SB*1.0*`)
  lines.push(`<TABLE>SHIPPING_BILL`)
  lines.push(
    `<F>MESSAGE_TYPE^CHA_ID^JOB_NO^JOB_DATE^EXPORTER_ID^EXPORTER_BRANCH^CONSIGNEE_ID^LOADING_PORT^DEST_PORT^DISCHARGE_PORT^SEAL_TYPE^NATURE_OF_CARGO^GROSS_WEIGHT^NET_WEIGHT^UOM^PACKAGES^MARKS`
  )
  lines.push(
    `<R>F^1000^${valueOrFallback(v.jobNumber, bill.id)}^${valueOrFallback(v.jobDate, '')}^${valueOrFallback(v.exporterId, '')}^${valueOrFallback(v.exporterBranchId, '')}^${valueOrFallback(v.consigneeId, '')}^${valueOrFallback(v.loadingPort, '')}^${valueOrFallback(v.finalDestinationPort, '')}^${valueOrFallback(v.dischargePort, valueOrFallback(v.finalDestinationPort, ''))}^${valueOrFallback(v.sealType, '')}^${valueOrFallback(v.natureOfCargo, '')}^${valueOrFallback(v.grossWeight, '')}^${valueOrFallback(v.netWeight, '')}^${valueOrFallback(v.measurementUnit, 'KGS')}^${valueOrFallback(v.totalPackages, '')}^${valueOrFallback(v.marksAndNumbers, '').replace(/[\^\r\n]+/g, ' ')}`
  )

  if (v.invoices.length > 0) {
    lines.push(`<TABLE>INVOICE`)
    lines.push(`<F>INVOICE_SN^INVOICE_NO^INVOICE_DATE^CURRENCY^CONTRACT_TYPE^BUYER_ID^FREIGHT_AMOUNT^INSURANCE_AMOUNT`)
    v.invoices.forEach((inv, idx) => {
      lines.push(
        `<R>${idx + 1}^${inv.invoiceNumber}^${valueOrFallback(inv.invoiceDate, '')}^${valueOrFallback(inv.currency, 'USD')}^${valueOrFallback(inv.contractType, '1')}^${valueOrFallback(inv.buyerId, valueOrFallback(v.consigneeId, ''))}^${valueOrFallback(inv.freightAmount, 0)}^${valueOrFallback(inv.insuranceAmount, 0)}`
      )
    })

    lines.push(`<TABLE>ITEM`)
    lines.push(`<F>INVOICE_SN^ITEM_SN^RITC_CODE^DESCRIPTION^QUANTITY^UOM^UNIT_PRICE^LINE_TOTAL^SCHEME_CODE`)
    v.invoices.forEach((inv, invIdx) => {
      inv.items.forEach((item, itemIdx) => {
        const total = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
        lines.push(
          `<R>${invIdx + 1}^${itemIdx + 1}^${valueOrFallback(item.ritcCode, '')}^${valueOrFallback(item.goodsDescription1, '').replace(/[\^\r\n]+/g, ' ')}^${valueOrFallback(item.quantity, '')}^${valueOrFallback(item.unitOfMeasurement, 'PCS')}^${valueOrFallback(item.unitPrice, '')}^${total.toFixed(2)}^${valueOrFallback(item.schemeCode, '')}`
        )
      })
    })
  }

  if (v.packingRanges.length > 0) {
    lines.push(`<TABLE>PACKING`)
    lines.push(`<F>FROM_PKG^TO_PKG^PKG_CODE`)
    v.packingRanges.forEach((pkg) => {
      lines.push(`<R>${pkg.packingNumberFrom}^${pkg.packingNumberTo}^${valueOrFallback(pkg.packingCode, 'CTN')}`)
    })
  }

  lines.push(`TREC**ZZ*${valueOrFallback(v.loadingPort, 'INMUN1')}*ZZ*ICEGATE*01*SB*1.0*`)

  return lines.join('\r\n')
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}

export const MOCK_SEED_SHIPPING_BILLS = [
  {
    id: 1000,
    jobNumber: 150011,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1790967817
  },
  {
    id: 1001,
    jobNumber: 150012,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1790968385
  },
  {
    id: 1002,
    jobNumber: 150013,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1790969061
  },
  {
    id: 1003,
    jobNumber: 150014,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1790969592
  },
  {
    id: 1004,
    jobNumber: 150015,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791003787
  },
  {
    id: 1005,
    jobNumber: 150016,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791010527
  },
  {
    id: 1006,
    jobNumber: 150017,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791138507
  },
  {
    id: 1007,
    jobNumber: 150018,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791139137
  },
  {
    id: 1008,
    jobNumber: 150019,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791139150
  },
  {
    id: 1009,
    jobNumber: 150020,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791139885
  },
  {
    id: 1010,
    jobNumber: 150021,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791140799
  },
  {
    id: 1011,
    jobNumber: 150022,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791140811
  },
  {
    id: 1012,
    jobNumber: 150023,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791141353
  },
  {
    id: 1013,
    jobNumber: 150024,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791141776
  },
  {
    id: 1014,
    jobNumber: 150025,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791143087
  },
  {
    id: 1021,
    jobNumber: 150026,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791183194
  },
  {
    id: 1023,
    jobNumber: 150028,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791449123
  },
  {
    id: 1024,
    jobNumber: 150029,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791449142
  },
  {
    id: 1025,
    jobNumber: 150030,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791449171
  },
  {
    id: 1026,
    jobNumber: 150031,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791449252
  },
  {
    id: 1027,
    jobNumber: 150032,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791449308
  },
  {
    id: 1028,
    jobNumber: 150033,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791452556
  }
]

const mockSeedBills: SavedBill[] = MOCK_SEED_SHIPPING_BILLS.map((seed) => {
  const updated = new Date(seed.updated * 1000).toISOString()
  const jobDate = new Date(seed.jobDate * 86400000).toISOString().slice(0, 10)

  return {
    id: seed.id,
    created: updated,
    updated,
    values: {
      ...emptyBill(),
      jobNumber: String(seed.jobNumber),
      jobDate,
      exporterName: seed.exporterName,
      consigneeName: seed.consigneeName,
      loadingPort: seed.loadingPort,
      finalDestinationPort: seed.destinationPort,
      dischargePort: seed.dischargePort
    }
  }
})

function getBills(): SavedBill[] {
  const billsById = new Map(mockSeedBills.map((bill) => [bill.id, bill]))
  for (const bill of getDemoData().bills) {
    billsById.set(bill.id, bill)
  }
  return Array.from(billsById.values()).sort((first, second) => second.updated.localeCompare(first.updated))
}

function addPartyNames(values: ShippingBillFormValues): ShippingBillFormValues {
  const { exporters, businesses } = getDemoData()
  const exporter = exporters.find((item) => String(item.id) === values.exporterId)
  const consignee = businesses.find((item) => String(item.id) === values.consigneeId)

  return {
    ...values,
    exporterName: exporter?.name ?? values.exporterName,
    consigneeName: consignee?.name ?? values.consigneeName
  }
}

export const shippingBillService = {
  async getById(id: string | number): Promise<SavedBill | undefined> {
    const bill = getBills().find((item) => String(item.id) === String(id))
    return delay(bill, 180)
  },

  async list(): Promise<SavedBill[]> {
    return delay(getBills(), 250)
  },

  async saveDraft(values: ShippingBillFormValues, id?: number): Promise<SavedBill> {
    await delay(undefined, 150)
    return saveBill(addPartyNames(values), id)
  },

  async upsert(values: ShippingBillFormValues, id?: number): Promise<SavedBill> {
    const errors = validateShippingBillSubmission(values)
    if (errors.length) throw new Error(errors.join(' '))
    await delay(undefined, 350)
    return saveBill(addPartyNames(values), id)
  },

  async downloadFlatFile(
    id: string | number,
    billData?: SavedBill,
    fallbackFilename?: string
  ): Promise<{ source: 'local' }> {
    await delay(undefined, 150)
    const bill = billData ?? (await this.getById(id))
    if (!bill) throw new Error(`Shipping bill ${id} could not be found.`)

    const content = generateFlatFileContent(bill)
    const safeJob = valueOrFallback(bill.values.jobNumber, bill.id)
    const filename = valueOrFallback(fallbackFilename, `shipping_bill_${safeJob}.sb`)
    triggerBlobDownload(new Blob([content], { type: 'text/plain;charset=utf-8' }), filename)
    return { source: 'local' }
  }
}
