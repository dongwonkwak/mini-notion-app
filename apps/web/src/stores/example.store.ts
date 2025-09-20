/**
 * Example Zustand store demonstrating state management patterns
 * 
 * This store shows how to manage application state using Zustand
 * with TypeScript for type safety and persistence support.
 * 
 * @example
 * ```typescript
 * import { useExampleStore } from '@/stores/example.store'
 * 
 * function MyComponent() {
 *   const { count, increment, decrement } = useExampleStore()
 *   
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <button onClick={increment}>+</button>
 *       <button onClick={decrement}>-</button>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @since 1.0.0
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ExampleState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useExampleStore = create<ExampleState>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
        reset: () => set({ count: 0 }),
      }),
      {
        name: 'example-storage',
      }
    )
  )
)