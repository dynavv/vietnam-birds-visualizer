import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveDynamicPhoto, clearPhotoCache } from './photoResolver';

describe('photoResolver Utility', () => {
  beforeEach(() => {
    clearPhotoCache();
    vi.restoreAllMocks();
  });

  it('returns null for empty or invalid scientific name', async () => {
    const result1 = await resolveDynamicPhoto('');
    const result2 = await resolveDynamicPhoto(null as unknown as string);
    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it('resolves photo from iNaturalist API when available', async () => {
    const mockInatResponse = {
      results: [
        {
          id: 339874,
          name: 'Trochalopteron formosum',
          default_photo: {
            medium_url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/576761843/medium.jpg',
            large_url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/576761843/large.jpg',
            attribution: '(c) tobytrung, some rights reserved (CC BY-NC)',
            license_code: 'cc-by-nc'
          }
        }
      ]
    };

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockInatResponse
    });

    const result = await resolveDynamicPhoto('Trochalopteron formosum');
    expect(result).not.toBeNull();
    expect(result?.imageUrl).toBe('https://inaturalist-open-data.s3.amazonaws.com/photos/576761843/large.jpg');
    expect(result?.source).toBe('inaturalist');
    expect(result?.artist).toContain('tobytrung');
  });

  it('caches the resolved photo to prevent duplicate network calls', async () => {
    const mockInatResponse = {
      results: [
        {
          id: 12345,
          default_photo: {
            medium_url: 'https://example.com/cached.jpg',
            attribution: 'Author'
          }
        }
      ]
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockInatResponse
    });
    globalThis.fetch = fetchMock;
 
     await resolveDynamicPhoto('Polyplectron germaini');
     await resolveDynamicPhoto('Polyplectron germaini');
 
     expect(fetchMock).toHaveBeenCalledTimes(1);
   });
 
   it('falls back to Wikipedia when iNaturalist fails or has no photo', async () => {
     // iNaturalist returns empty
     const mockInatResponse = { results: [] };
     // Wikipedia returns valid image
     const mockWikiResponse = {
       originalimage: {
         source: 'https://upload.wikimedia.org/wikipedia/commons/bird.jpg'
       },
       thumbnail: {
         source: 'https://upload.wikimedia.org/wikipedia/commons/thumb/bird.jpg'
       },
       content_urls: {
         desktop: {
           page: 'https://en.wikipedia.org/wiki/Bird'
         }
       }
     };
 
     globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockInatResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => mockWikiResponse });

    const result = await resolveDynamicPhoto('Rare Bird');
    expect(result).not.toBeNull();
    expect(result?.source).toBe('wikipedia');
    expect(result?.imageUrl).toBe('https://upload.wikimedia.org/wikipedia/commons/bird.jpg');
  });
});
