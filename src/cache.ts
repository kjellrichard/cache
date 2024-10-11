import { tmpdir } from 'os'
import { stat, writeFile, readFile, unlink } from 'fs/promises'

let cacheDir: string = process.env.CACHE_DIR ?? tmpdir() ?? __dirname
let prefix: string = process.env.CACHE_PREFIX ?? ''

function getFilepath(key: string): string {
    return `${cacheDir}/${prefix}${key}.cache.json`
}
export function config(prefix?: string, cacheDir?: string): { prefix: string, cacheDir: string } {
    if (prefix)
        setPrefix(prefix)
    if (cacheDir)
        setCacheDir(cacheDir)
    return getConfig()
}


export function setCacheDir(dir: string): string {
    return cacheDir = dir
}

export function setPrefix(p: string): string {
    return prefix = p
}

export function getConfig(): { prefix: string, cacheDir: string } {
    return { prefix, cacheDir }
}

export type MaxAgeObject = {
    d?: number
    h?: number
    m?: number
    s?: number
    ms?: number
    days?: number
    hours?: number
    minutes?: number
    seconds?: number
    milliseconds?: number
}
export type MaxAgeParam = string | number | MaxAgeObject

export function maxAgeToMs(maxAge: MaxAgeParam): number {
    if (typeof maxAge === 'number')
        return maxAge
    if (typeof maxAge === 'string') {
        const num = maxAge.match(/\d+/)?.[0]
        const unit = maxAge.match(/[a-z]+/)?.[0]
        if (!num || !unit || !['days', 'hours', 'minutes', 'seconds', 'milliseconds', 'd', 'h', 'm', 's', 'ms'].includes(unit))
            throw new Error('Invalid maxAge string')
        return maxAgeToMs({ [unit]: +num })
    }
    return (maxAge.days ?? maxAge.d ?? 0) * 86400000 +
        (maxAge.hours ?? maxAge.h ?? 0) * 3600000 +
        (maxAge.minutes ?? maxAge.m ?? 0) * 60000 +
        (maxAge.seconds ?? maxAge.s ?? 0) * 1000 +
        (maxAge.milliseconds ?? maxAge.ms ?? 0)
}

export async function has(key: string) {
    try {
        const filePath = getFilepath(key)
        const s = await stat(filePath)
        return s.isFile()
    } catch (e) {
        if (e.code === 'ENOENT')
            return false
        throw e
    }
}

export async function del(key: string) {
    const filePath = getFilepath(key)
    try {
        await unlink(filePath)
    } catch (e) {
        if (e.code !== 'ENOENT')
            throw e
    }
}

export async function get<T>(key: string, maxAge?: MaxAgeParam): Promise<T | null> {
    try {
        const filePath = getFilepath(key)
        const s = await stat(filePath)
        if (!s.isFile())
            return null

        const age = Date.now() - s.mtimeMs
        if (maxAge && age > maxAgeToMs(maxAge))
            return null
        const data = await readFile(filePath, 'utf8')
        return JSON.parse(data)
    } catch (e) {
        if (e.code === 'ENOENT')
            return null
        throw e
    }
}

export async function put<T>(key: string, value: T): Promise<T> {
    const filePath = getFilepath(key)
    const contentToWrite = JSON.stringify(value)
    await writeFile(filePath, contentToWrite, 'utf8')
    return value
}

export async function withCache<T>(cacheKey: string, getter: Promise<T>, maxAge: MaxAgeParam, verbose = false): Promise<{ foundInCache: boolean, result: T, elapsed: number }> {
    const start = Date.now();
    const cached = await get<T>(cacheKey, maxAge);

    if (cached) {
        const elapsed = Date.now() - start
        verbose && console.log(`Cache hit for ${cacheKey}. Took ${elapsed}ms`);
        return { foundInCache: true, result: cached, elapsed };
    } else {
        const freshData = await getter;
        await put(cacheKey, freshData);
        const elapsed = Date.now() - start
        verbose && console.log(`Cache miss for ${cacheKey}. Got fresh data. Took ${elapsed}ms`);
        return {
            foundInCache: false,
            result: freshData,
            elapsed
        }
    }
}

