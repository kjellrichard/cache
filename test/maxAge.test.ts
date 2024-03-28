
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { MaxAgeParam, maxAgeToMs } from '../src/cache'


describe('MaxAge', () => {

    it('should throw error for invalid max age string', () => {
        expect(() => maxAgeToMs('15')).toThrowError('Invalid maxAge string')
        expect(() => maxAgeToMs('15 jalla')).toThrowError('Invalid maxAge string')
        expect(() => maxAgeToMs('minutes')).toThrowError('Invalid maxAge string')
    })

    it('should convert number max age correctly', () => {
        const maxAge: MaxAgeParam = 1000
        const maxAgeMs = maxAgeToMs(maxAge)
        expect(maxAgeMs).toBe(1000)
    })

    it('should convert string max age correctly', () => {
        const maxAgeMs15 = maxAgeToMs('15 seconds')
        expect(maxAgeMs15).toBe(15000)

        const maxAgeMs1 = maxAgeToMs('1 m')
        expect(maxAgeMs1).toBe(60000)

        const maxAgeMs2 = maxAgeToMs('2 hours')
        expect(maxAgeMs2).toBe(7200000)

        const maxAgeMs3 = maxAgeToMs('3 days')
        expect(maxAgeMs3).toBe(259200000)
    })

    it('should convert object max age correctly', () => {
        const maxAgeMs15 = maxAgeToMs({ days: 15, hours: 15, minutes: 15, seconds: 15, milliseconds: 15 })
        expect(maxAgeMs15).toBe(15 * 86400000 + 15 * 3600000 + 15 * 60000 + 15 * 1000 + 15)

        const maxAgeMs1 = maxAgeToMs({ m: 1 })
        expect(maxAgeMs1).toBe(60000)

        const maxAgeMs2 = maxAgeToMs({ h: 2 })
        expect(maxAgeMs2).toBe(7200000)

        const maxAgeMs3 = maxAgeToMs({ days: 3 })
        expect(maxAgeMs3).toBe(259200000)

        const maxAgeMs4 = maxAgeToMs({ ms: 4 })
        expect(maxAgeMs4).toBe(4)
    })
})
