import { RrCaretDown } from 'icons/rr/fi-rr-caret-down'
import { useEffect, useRef, useState } from 'react'
import type { RegisterOptions } from 'ui/form'
import { getFormContext, useController } from 'ui/form'
import { InputError } from 'ui/inputs/error'
import { Popover, PopoverContent, PopoverTrigger } from 'ui/interactive/popover'
import { PopoverContext } from 'ui/interactive/popover-context'
import { clsx, getContext } from 'ui/utils'
import { ShippingBillFormValues } from './model'

type StringSelectPath =
  | 'exporterId'
  | 'exporterBranchId'
  | 'consigneeId'
  | 'consigneeBranchId'
  | 'loadingPort'
  | 'finalDestinationPort'
  | 'dischargePort'
  | 'marksAndNumbers'
  | `invoices.${number}.buyerId`
  | `invoices.${number}.buyerBranchId`
  | `invoices.${number}.thirdPartyId`
  | `invoices.${number}.thirdPartyBranchId`
  | `invoices.${number}.items.${number}.itemThirdPartyId`
  | `invoices.${number}.items.${number}.itemThirdPartyBranchId`
  | `documents.${number}.documentTypeCode`
  | `documents.${number}.fileType`

export interface AsyncOption {
  value: string
  label: string
  sublabel?: string
}

interface AsyncPartySelectProps {
  name: StringSelectPath
  placeholder?: string
  disabled?: boolean
  className?: string
  rules?: RegisterOptions<ShippingBillFormValues>
  deps?: React.DependencyList
  fetchOptions: (query: string) => Promise<AsyncOption[]>
  getInitialLabel?: (id: string) => Promise<string>
}

export function AsyncPartySelect({
  name,
  placeholder = 'Search...',
  disabled = false,
  className,
  rules,
  deps = [],
  fetchOptions,
  getInitialLabel
}: AsyncPartySelectProps) {
  const ctx = getFormContext<ShippingBillFormValues>()
  const {
    field: { onChange, value, ref }
  } = useController<ShippingBillFormValues>({
    name,
    control: ctx.hooks.control,
    rules: ctx.schema.shape[name] ?? rules,
    disabled
  })

  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<AsyncOption[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const fetchOptionsRef = useRef(fetchOptions)
  fetchOptionsRef.current = fetchOptions

  const getInitialLabelRef = useRef(getInitialLabel)
  getInitialLabelRef.current = getInitialLabel
  const selectedValue = typeof value === 'string' ? value : ''

  useEffect(() => {
    let active = true
    if (selectedValue) {
      if (getInitialLabelRef.current) {
        void getInitialLabelRef
          .current(selectedValue)
          .then((label) => {
            if (active && label) {
              setSelectedLabel(label)
              setLoadError('')
            }
          })
          .catch(() => {
            if (active) setLoadError('Could not load the selected label.')
          })
      } else {
        const found = options.find((option) => option.value === selectedValue)
        if (found) setSelectedLabel(found.label)
      }
    } else {
      setSelectedLabel('')
      setLoadError('')
    }

    return () => {
      active = false
    }
  }, [selectedValue, ...deps])

  useEffect(() => {
    if (!isOpen && !query) return

    let active = true
    setLoading(true)
    setLoadError('')
    const timer = setTimeout(() => {
      void fetchOptionsRef
        .current(query)
        .then((results) => {
          if (active) {
            setOptions(results)
            setLoading(false)
          }
        })
        .catch(() => {
          if (active) {
            setOptions([])
            setLoading(false)
            setLoadError('Could not load choices. Try again.')
          }
        })
    }, 200)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, isOpen, ...deps])

  return (
    <div>
      <input type="hidden" name={name} value={selectedValue} ref={ref} disabled={disabled} />
      <Popover placement="bottom-start" fallbackPlacements={['top-start']} onOpenCallback={setIsOpen}>
        <PopoverTrigger
          className={clsx(
            'outline-focus-select group flex w-full cursor-pointer items-center justify-between rounded border border-gray-200 pr-2 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50',
            `${className ?? 'bg-white'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`
          )}
          disabled={disabled}>
          <div className="flex items-center p-2 text-sm">
            <span className={selectedLabel ? 'font-medium text-gray-900' : 'text-gray-400'}>
              {selectedLabel || placeholder}
            </span>
          </div>
          <RrCaretDown className="size-4 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
        </PopoverTrigger>
        <InputError<ShippingBillFormValues> name={name} />
        <PopoverContent className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type to search..."
              className="focus:border-primary-500 focus:ring-primary-500 w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:ring-1"
              autoFocus
            />
          </div>
          {loadError && (
            <p role="alert" className="px-3 py-2 text-xs text-red-700">
              {loadError}
            </p>
          )}
          <div className="max-h-56 overflow-y-auto p-1">
            {loading ? (
              <div className="p-3 text-center text-xs text-gray-500">Searching mock service...</div>
            ) : options.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400">No matching results found</div>
            ) : (
              options.map((option) => (
                <PopoverOptionItem
                  key={option.value}
                  option={option}
                  isSelected={selectedValue === option.value}
                  onSelect={(selected) => {
                    onChange(selected.value)
                    setSelectedLabel(selected.label)
                    setQuery('')
                  }}
                />
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function PopoverOptionItem({
  option,
  isSelected,
  onSelect
}: {
  option: AsyncOption
  isSelected: boolean
  onSelect: (option: AsyncOption) => void
}) {
  const { setOpen } = getContext(PopoverContext)

  return (
    <div
      onClick={() => {
        onSelect(option)
        setOpen(false)
      }}
      className={clsx(
        'flex cursor-pointer flex-col rounded p-2 text-sm transition-colors',
        isSelected ? 'bg-primary-50 text-primary-900 font-semibold' : 'text-gray-950 hover:bg-gray-100'
      )}>
      <span>{option.label}</span>
      {option.sublabel && <span className="text-xs text-gray-500">{option.sublabel}</span>}
    </div>
  )
}
