
import { describe, it, expect, beforeAll, afterAll, expectTypeOf } from 'vitest'
import { put, get, del, has, setCacheDir, setPrefix, withCache } from '../src/cache'
import { unlink, readdir } from 'fs/promises'
import { beforeEach } from 'node:test'

const cacheDir = __dirname
const prefix = '_test.'

async function clearCache() {
    const files = await readdir(cacheDir)
    for (const file of files) {
        if (file.startsWith(prefix))
            await unlink(`${cacheDir}/${file}`)
    }
}

describe('Cache', () => {
    beforeAll(() => {
        setPrefix(prefix)
        setCacheDir(__dirname)
    })

    beforeEach(async () => {
        await clearCache()

    })
    afterAll(async () => {
        await clearCache()
    })

    it('should store a value in the cache', async () => {
        const key = 'testKey'
        const value = 'testValue'
        await put(key, value)
        const result = await get(key)
        expect(result).toEqual(value)
    })

    it('should retrieve a value from the cache', async () => {
        const key = 'testKey'
        const value = 'testValue'
        await put(key, value)
        const result = await get(key)
        expect(result).toEqual(value)
    })

    it('should delete a value from the cache', async () => {
        const key = 'testKey'
        const value = 'testValue'
        await put(key, value)
        await del(key)
        const result = await get(key)
        expect(result).toBeNull()
    })

    it('should check if a value exists in the cache', async () => {
        const key = 'testKey'
        const value = 'testValue'
        await put(key, value)
        const exists = await has(key)
        expect(exists).toBe(true)
    })

    it('should not get a value that has expired', async () => {
        const key = 'testKey'
        const value = 'testValue'
        await put(key, value)
        await new Promise(resolve => setTimeout(resolve, 11))
        const result = await get(key, '10 ms')
        expect(result).toBeNull()
    })

    it('should get value using withCache method', async () => {
        const getter = async (value: string) => value
        const key = 'testKey'
        const value = 'testValue'
        const result = await withCache(key, getter(value), { ms: 10 })

        expect(result.result).toEqual(value)
        expect(result.foundInCache).toEqual(false)
        expectTypeOf(result.elapsed).toBeNumber
        const result2 = await withCache(key, getter(value), { ms: 10 })
        expect(result2.result).toEqual(value)
        expect(result2.foundInCache).toEqual(true)
        expectTypeOf(result2.elapsed).toBeNumber
    })
})
