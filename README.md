# Cache

A simple, efficient caching module for Node.js applications.

It handles maxAge (aka ttl) and the storage location and file names can be configured

See [MaxAgeParam](#maxageparam) and [Config](#config)

## Installation

Install the package via npm:

```bash
npm install @ricb/cache
```

## Usage

### Store and retrieve

```typescript
import { put, get } from '@ricb/cache';

const key = 'testKey';
const value = 'testValue';

await put(key, value);
const result = await get(key);
console.log(result); // Outputs: 'testValue'
```

### Retrieve with max age

```typescript
import { put, get } from '@ricb/cache';

const key = 'testKey';
const value = 'testValue';

await put(key, value);
await new Promise(resolve => setTimeout(resolve, 11));
const result = await get(key, '10 ms');
console.log(result); // Outputs: null
```

## MaxAgeParam

`MaxAgeParam` is a type that can be a `string`, `number`, or `MaxAgeObject`. It is used to specify the maximum age for a cache entry.

### MaxAgeObject

`MaxAgeObject` is an object that can have the following properties:

- `d` or `days`: The number of days.
- `h` or `hours`: The number of hours.
- `m` or `minutes`: The number of minutes.
- `s` or `seconds`: The number of seconds.
- `ms` or `milliseconds`: The number of milliseconds.

Each property is optional and can be used to specify the maximum age in different units of time.

### maxAgeToMs Function

The `maxAgeToMs` function is used to convert a `MaxAgeParam` to milliseconds. It accepts a `MaxAgeParam` as an argument and returns a number.

If the `MaxAgeParam` is a number, it is returned as is. If it is a string, it is parsed and converted to milliseconds. If it is a `MaxAgeObject`, each property is converted to milliseconds and summed up.

Here are some examples of how to use `maxAgeToMs`:

```typescript
// Using a number
const maxAgeMs1 = maxAgeToMs(1000);
console.log(maxAgeMs1); // Outputs: 1000

// Using a string
const maxAgeMs2 = maxAgeToMs('2 hours');
console.log(maxAgeMs2); // Outputs: 7200000

// Using a MaxAgeObject
const maxAgeMs3 = maxAgeToMs({ days: 3 });
console.log(maxAgeMs3); // Outputs: 259200000
```

## Config

The `cache` module allows you to configure the cache directory and prefix using the `init` function or `setCacheDir` and `setPrefix` functions.

### init Function

The `init` function is used to initialize the cache directory and prefix. It accepts two optional arguments:

- `prefix`: The prefix to be used for the cache files.
- `cacheDir`: The directory where the cache files will be stored.

If these arguments are not provided, the function will use the `CACHE_DIR` and `CACHE_PREFIX` environment variables. If these environment variables are also not set, it will use the system's temporary directory for `cacheDir` and an empty string for `prefix`.

### setCacheDir Function

The `setCacheDir` function is used to set the cache directory. It accepts one argument:

- `dir`: The directory where the cache files will be stored.

### setPrefix Function

The `setPrefix` function is used to set the prefix for the cache files. It accepts one argument:

- `p`: The prefix to be used for the cache files.

Here are some examples of how to use these functions:

```typescript
// Initialize with a prefix and cache directory
init('_test.', __dirname);

// or set them individually
setCacheDir(__dirname);
setPrefix('_test.');
```
