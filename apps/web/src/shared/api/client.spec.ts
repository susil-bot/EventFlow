import { ApiError, apiRequest, getErrorMessage } from './client';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('unwraps data and turns error bodies into ApiErrors with field errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(200, { data: { ok: true } }))
        .mockResolvedValueOnce(
          jsonResponse(400, {
            error: {
              code: 'VALIDATION_FAILED',
              message: 'Please correct the highlighted fields.',
              details: { fields: { title: 'Title is required.' } }
            }
          })
        )
    );

    await expect(apiRequest('/ok')).resolves.toEqual({ ok: true });
    await expect(apiRequest('/bad')).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_FAILED',
      fieldErrors: { title: 'Title is required.' }
    });
  });

  it('reports network failures and server error references clearly', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(
          jsonResponse(500, {
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Something went wrong. Please try again.',
              requestId: '0123abcd-ffff'
            }
          })
        )
    );

    await expect(apiRequest('/down')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR'
    });
    const serverError = await apiRequest('/boom').catch(
      (error: unknown) => error
    );
    expect(serverError).toBeInstanceOf(ApiError);
    expect(getErrorMessage(serverError)).toBe(
      'Something went wrong on our side. Please try again. (reference: 0123abcd)'
    );
  });

  it('names the problem for validation errors, without a reference', () => {
    const one = new ApiError(
      400,
      'VALIDATION_FAILED',
      'Please correct the highlighted fields.',
      { startsAtLocal: 'Start time must be in the future.' },
      '7537c614-aaaa'
    );
    expect(getErrorMessage(one)).toBe('Start time must be in the future.');

    const two = new ApiError(
      400,
      'VALIDATION_FAILED',
      'Please correct the highlighted fields.',
      { title: 'Title is required.', capacity: 'Capacity is required.' },
      '7537c614-aaaa'
    );
    expect(getErrorMessage(two)).toBe(
      'Please correct the 2 highlighted fields.'
    );

    const conflict = new ApiError(
      409,
      'EVENT_FULL',
      'This event is fully booked.',
      {},
      'abc'
    );
    expect(getErrorMessage(conflict)).toBe('This event is fully booked.');
  });
});
