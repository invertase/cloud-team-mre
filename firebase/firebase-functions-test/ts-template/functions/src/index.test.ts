import { helloWorld_v1, helloWorld_v2 } from './index'
import { wrapV1 } from 'firebase-functions-test/lib/v1';
import { wrapV2 } from 'firebase-functions-test/lib/v2';
import { CallableRequest } from 'firebase-functions/https';
import { describe, it, expect } from 'vitest';

// Sample test for v1
describe('helloWorld_v1', () => {
  it('should return a greeting message', async () => {
    const wrappedHelloWorld = wrapV1(helloWorld_v1);
    const result = await wrappedHelloWorld(null);
    expect(result).toEqual({
      message: 'Hello from Firebase Functions!',
    });
  });
});

// Sample test for v2
describe('helloWorld_v2', () => {
  it('should return a greeting message', async () => {
    const wrappedHelloWorld = wrapV2(helloWorld_v2);
    const result = await wrappedHelloWorld({} as CallableRequest<any>);
    expect(result).toEqual({
      message: 'Hello from Firebase Functions!',
    });
  });
});
