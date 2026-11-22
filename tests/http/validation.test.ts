import { HttpError } from '@/server/http/http-error';
import { parseBody, parseQuery } from '@/server/http/validation';
import { listAuctionsQuerySchema } from '@/server/schemas/auction.schema';
import { listBidsQuerySchema } from '@/server/schemas/bid.schema';
import { updateLotSchema } from '@/server/schemas/lot.schema';
import { describe, expect, it } from 'vitest';

const jsonRequest = (body: unknown) =>
  new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

describe('parseBody', () => {
  it('returns the validated data', async () => {
    await expect(parseBody(jsonRequest({ title: ' Vase ' }), updateLotSchema)).resolves.toEqual({ title: 'Vase' });
  });

  it('strips fields that are not part of the schema', async () => {
    const data = await parseBody(jsonRequest({ title: 'Vase', isSold: true }), updateLotSchema);

    expect(data).not.toHaveProperty('isSold');
  });

  it('rejects invalid JSON and invalid data with 400', async () => {
    await expect(parseBody(jsonRequest('{not json'), updateLotSchema)).rejects.toMatchObject({ status: 400 });
    await expect(parseBody(jsonRequest({ startBid: -5 }), updateLotSchema)).rejects.toBeInstanceOf(HttpError);
  });
});

describe('parseQuery', () => {
  it('coerces numbers and booleans and parses JSON arrays', () => {
    const request = new Request(
      'http://localhost/api/auction?page=2&limit=4&loadForCurrentUser=true&minLotPrice=10&categories=["Art","Toys"]'
    );

    expect(parseQuery(request, listAuctionsQuerySchema)).toEqual({
      page: 2,
      limit: 4,
      loadForCurrentUser: true,
      minLotPrice: 10,
      categories: ['Art', 'Toys'],
    });
  });

  it('applies defaults', () => {
    expect(parseQuery(new Request('http://localhost/api/auction'), listAuctionsQuerySchema)).toMatchObject({
      page: 1,
      limit: 8,
    });
  });

  it('rejects malformed identifiers', () => {
    expect(() => parseQuery(new Request('http://localhost/api/bid?lotId=nope'), listBidsQuerySchema)).toThrow(
      HttpError
    );
  });
});
