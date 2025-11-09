import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

Element.prototype.scrollIntoView = vi.fn()

afterEach(() => {
  cleanup()
})