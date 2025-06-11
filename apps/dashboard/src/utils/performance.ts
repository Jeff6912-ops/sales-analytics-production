// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map()
  private static isEnabled = process.env.NODE_ENV === 'development'

  static start(label: string): void {
    if (!this.isEnabled) return
    this.timers.set(label, performance.now())
  }

  static end(label: string): number {
    if (!this.isEnabled) return 0
    
    const startTime = this.timers.get(label)
    if (!startTime) return 0
    
    const duration = performance.now() - startTime
    console.log(`⏱️ [Performance] ${label}: ${duration.toFixed(2)}ms`)
    this.timers.delete(label)
    return duration
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label)
    try {
      const result = fn()
      this.end(label)
      return result
    } catch (error) {
      this.end(label)
      throw error
    }
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label)
    try {
      const result = await fn()
      this.end(label)
      return result
    } catch (error) {
      this.end(label)
      throw error
    }
  }
}

// Debounce utility for filtering
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for real-time updates
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Memory usage monitoring
export function logMemoryUsage(label: string): void {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
    const memory = (window.performance as any).memory
    console.log(`🧠 [Memory] ${label}:`, {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`
    })
  }
}

// Connection status monitor
export class ConnectionMonitor {
  private static listeners: Set<(status: 'online' | 'offline') => void> = new Set()
  private static currentStatus: 'online' | 'offline' = 'online'

  static init(): void {
    if (typeof window === 'undefined') return

    const updateStatus = () => {
      const newStatus = navigator.onLine ? 'online' : 'offline'
      if (newStatus !== this.currentStatus) {
        this.currentStatus = newStatus
        this.listeners.forEach(listener => listener(newStatus))
      }
    }

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    updateStatus()
  }

  static addListener(listener: (status: 'online' | 'offline') => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  static getStatus(): 'online' | 'offline' {
    return this.currentStatus
  }
} 