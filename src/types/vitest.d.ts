import '@testing-library/jest-dom'
import 'vitest'

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R
  toHaveTextContent(text: string | RegExp): R
  toBeDisabled(): R
  toHaveClass(...classNames: string[]): R
  toHaveFocus(): R
  toHaveAttribute(attr: string, value?: string): R
  toBeVisible(): R
  toBeChecked(): R
  toHaveValue(value: string | number): R
  toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R
  toBeEmptyDOMElement(): R
  toBeInvalid(): R
  toBeRequired(): R
  toHaveDescription(text?: string | RegExp): R
  toHaveErrorMessage(text?: string | RegExp): R
  toHaveAccessibleDescription(text?: string | RegExp): R
  toHaveAccessibleName(text?: string | RegExp): R
  toBePartiallyChecked(): R
  toHaveStyle(css: string | Record<string, any>): R
  toContainElement(element: HTMLElement | null): R
  toContainHTML(htmlText: string): R
  toHaveFormValues(expectedValues: Record<string, any>): R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}