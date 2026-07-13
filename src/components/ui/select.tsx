"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type ParsedOption = {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

function getOptionLabel(children: React.ReactNode): React.ReactNode {
  if (typeof children === "string" || typeof children === "number") {
    return children
  }

  if (Array.isArray(children)) {
    return children.map((child, index) => (
      <React.Fragment key={index}>{getOptionLabel(child)}</React.Fragment>
    ))
  }

  return children
}

function parseOptionChildren(children: React.ReactNode): ParsedOption[] {
  const options: ParsedOption[] = []

  React.Children.forEach(children, (child) => {
    if (
      !React.isValidElement<{ value?: string; disabled?: boolean; children?: React.ReactNode }>(
        child,
      )
    ) {
      return
    }

    if (child.type !== "option") {
      return
    }

    options.push({
      value: String(child.props.value ?? ""),
      label: getOptionLabel(child.props.children),
      disabled: child.props.disabled,
    })
  })

  return options
}

function Select({
  className,
  children,
  value,
  defaultValue,
  onChange,
  onValueChange,
  name,
  id,
  disabled,
  onBlur,
  title,
  size = "default",
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectPrimitive.Root>, "onValueChange"> & {
  className?: string
  children?: React.ReactNode
  onChange?: React.ChangeEventHandler<HTMLSelectElement>
  onValueChange?: (value: string) => void
  name?: string
  id?: string
  onBlur?: React.FocusEventHandler<HTMLButtonElement>
  title?: string
  size?: "sm" | "default"
  placeholder?: React.ReactNode
}) {
  const options = React.useMemo(() => parseOptionChildren(children), [children])
  const placeholderOption = options.find((option) => option.value === "")
  const selectableOptions = options.filter((option) => option.value !== "")
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    String(defaultValue ?? ""),
  )
  const currentValue = isControlled ? String(value ?? "") : uncontrolledValue

  const emitChange = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue)
      }

      onValueChange?.(nextValue)

      if (onChange) {
        onChange({
          target: { value: nextValue, name: name ?? "" },
        } as React.ChangeEvent<HTMLSelectElement>)
      }
    },
    [isControlled, name, onChange, onValueChange],
  )

  return (
    <>
      {name ? <input type="hidden" name={name} value={currentValue} /> : null}
      <SelectRoot
        value={currentValue === "" ? undefined : currentValue}
        onValueChange={emitChange}
        disabled={disabled}
        {...props}
      >
        <SelectTrigger
          id={id}
          size={size}
          className={className}
          onBlur={onBlur}
          title={title}
        >
          <SelectValue
            placeholder={placeholder ?? placeholderOption?.label ?? "Select an option"}
          />
        </SelectTrigger>
        <SelectContent>
          {selectableOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </>
  )
}

function SelectRoot({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-xl border border-input bg-background/60 px-4 text-sm text-foreground shadow-sm shadow-black/[0.02] transition-colors outline-none hover:border-foreground/25 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground data-[size=default]:h-11 data-[size=sm]:h-9 data-[size=sm]:rounded-lg data-[size=sm]:px-3 data-[size=sm]:text-xs [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 text-muted-foreground opacity-70" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          "relative z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border/80 bg-card/95 text-card-foreground shadow-xl shadow-black/10 ring-1 ring-black/[0.04] backdrop-blur-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onCloseAutoFocus?.(event)
        }}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2.5 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pr-8 pl-2.5 text-sm outline-hidden select-none transition-colors data-[highlighted]:bg-muted/40 data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4 text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-border/80", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-pointer items-center justify-center py-1 text-muted-foreground",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-pointer items-center justify-center py-1 text-muted-foreground",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
