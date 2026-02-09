export interface CompressionResult {
  compressed_prompt: string;
  original_tokens: number;
  compressed_tokens: number;
  compression_ratio: number;
}

export class ScaleDownService {
  private apiKey: string;
  private baseUrl = 'https://api.scaledown.com/v1/compress';
  private cache: Map<string, CompressionResult> = new Map();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async compressPrompt(prompt: string): Promise<CompressionResult> {
    const cacheKey = this.hashString(prompt);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (!this.apiKey || this.apiKey.trim() === '') {
      return {
        compressed_prompt: prompt,
        original_tokens: this.estimateTokens(prompt),
        compressed_tokens: this.estimateTokens(prompt),
        compression_ratio: 1.0,
      };
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          target_compression: 0.5,
        }),
      });

      if (!response.ok) {
        console.warn('ScaleDown API error, using uncompressed prompt');
        return {
          compressed_prompt: prompt,
          original_tokens: this.estimateTokens(prompt),
          compressed_tokens: this.estimateTokens(prompt),
          compression_ratio: 1.0,
        };
      }

      const data = await response.json();

      const result: CompressionResult = {
        compressed_prompt: data.compressed_prompt || prompt,
        original_tokens: data.original_tokens || this.estimateTokens(prompt),
        compressed_tokens: data.compressed_tokens || this.estimateTokens(data.compressed_prompt || prompt),
        compression_ratio: data.compression_ratio || 1.0,
      };

      this.cache.set(cacheKey, result);

      if (this.cache.size > 100) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      return result;
    } catch (error) {
      console.warn('ScaleDown compression failed, using uncompressed prompt:', error);
      return {
        compressed_prompt: prompt,
        original_tokens: this.estimateTokens(prompt),
        compressed_tokens: this.estimateTokens(prompt),
        compression_ratio: 1.0,
      };
    }
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  clearCache(): void {
    this.cache.clear();
  }
}
