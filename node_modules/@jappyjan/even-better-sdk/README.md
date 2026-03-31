# Even Better SDK

A lightweight wrapper around `@evenrealities/even_hub_sdk` for building pages
and elements that render inside the Even Hub app. It adds an opinionated API for
page composition, partial text updates, shared SDK initialization, and
configurable logging.

## Install

This package is published to npm.

```
npm install @jappyjan/even-better-sdk
```

## Quick start

```ts
import { EvenBetterSdk } from '@jappyjan/even-better-sdk';

const sdk = new EvenBetterSdk();

const page = sdk.createPage('example-page');
page
  .addTextElement('Hello from Even Better SDK')
  .setPosition(position => position.setX(12).setY(20))
  .setSize(size => size.setWidth(240).setHeight(60));

await page.render();
```

## Pages and elements

Create a page, add elements, and call `render()` to push the layout to the
Even Hub app. When the same page renders again, text elements are updated via
partial updates when only content changes.

```ts
import { EvenBetterSdk } from '@jappyjan/even-better-sdk';

const sdk = new EvenBetterSdk();
const page = sdk.createPage('dashboard');

const title = page.addTextElement('Status: OK');
const list = page.addListElement(['CPU', 'Memory', 'Disk']);

title
  .setPosition(position => position.setX(8).setY(8))
  .setSize(size => size.setWidth(280).setHeight(40));

list
  .setPosition(position => position.setX(8).setY(60))
  .setSize(size => size.setWidth(280).setHeight(160));

await page.render();

title.setContent('Status: Warning');
await page.render();
```

## Event capture

Mark a single element as the event capture target for the page.

```ts
const button = page.addTextElement('Tap me');
button.markAsEventCaptureElement();
await page.render();
```

## Storage helpers

The SDK exposes convenience wrappers for the Even Hub local storage APIs.

```ts
await sdk.setValue('last-viewed', new Date().toISOString());
const lastViewed = await sdk.getValue('last-viewed');
```

## Logging

```ts
import { EvenBetterSdk } from '@jappyjan/even-better-sdk';

EvenBetterSdk.setLogLevel('debug');
EvenBetterSdk.setLogger({
  info: message => console.info(message),
  warn: message => console.warn(message),
  error: message => console.error(message),
  debug: message => console.debug(message),
});
```

## Requirements

- The Even Hub app bridge must be available at runtime. The SDK waits for the
  bridge to be ready before rendering or using storage APIs.

## Development

```
nx build even-better-sdk
```
