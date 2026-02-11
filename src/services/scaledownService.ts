export interface CompressionResult {
  compressed_prompt: string;
  original_tokens: number;
  compressed_tokens: number;
  compression_ratio: number;
}

export class ScaleDownService {
  private apiKey: string;
  private baseUrl = 'https://api.scaledown.xyz/compress/raw/'; // From documentation
  private cache: Map<string, CompressionResult> = new Map();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async compressPrompt(prompt: string, context: string = ''): Promise<CompressionResult> {
    const cacheKey = this.hashString(prompt + context);

    // Return cached result if available
    if (this.cache.has(cacheKey)) {
      console.log('📦 Using cached compression result');
      return this.cache.get(cacheKey)!;
    }

    // If no API key, return uncompressed
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.warn('⚠️  No ScaleDown API key provided, skipping compression');
      return {
        compressed_prompt: prompt,
        original_tokens: this.estimateTokens(prompt),
        compressed_tokens: this.estimateTokens(prompt),
        compression_ratio: 1.0,
      };
    }

    try {
      console.log('🔄 Calling ScaleDown API...');
      console.log('📝 Original prompt length:', prompt.length, 'characters');
      console.log('📝 Estimated original tokens:', this.estimateTokens(prompt));

      const payload = {
        context: context || 'Smart home automation system',
        prompt: prompt,
        scaledown: {
          rate: 0,
        },
      };
      

      console.log('📤 Sending request to:', this.baseUrl);
      console.log('📤 Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ScaleDown API error:', response.status);
        console.error('❌ Error details:', errorText);
        console.warn('⚠️  Falling back to uncompressed prompt');
        
        return {
          compressed_prompt: prompt,
          original_tokens: this.estimateTokens(prompt),
          compressed_tokens: this.estimateTokens(prompt),
          compression_ratio: 1.0,
        };
      }

      const data = await response.json();
      console.log('✅ ScaleDown full response:', JSON.stringify(data, null, 2));

      // Parse the ScaleDown response
      let compressedPrompt = prompt;
      let originalTokens = this.estimateTokens(prompt);
      let compressedTokens = originalTokens;

      // Check different possible response formats
      if (data.results) {
        console.log('📋 Found results object');
        if (data.results.compressed_prompt) {
          compressedPrompt = data.results.compressed_prompt;
          originalTokens = data.results.total_original_tokens || this.estimateTokens(prompt);
          compressedTokens = data.results.total_compressed_tokens || this.estimateTokens(compressedPrompt);
          console.log('✅ Extracted from results.compressed_prompt');
        } else if (data.results.success && data.results.compressed_prompt !== undefined) {
          compressedPrompt = data.results.compressed_prompt;
          originalTokens = data.total_original_tokens || this.estimateTokens(prompt);
          compressedTokens = data.total_compressed_tokens || this.estimateTokens(compressedPrompt);
          console.log('✅ Extracted from results with success flag');
        }
      } else if (data.compressed_prompt !== undefined) {
        compressedPrompt = data.compressed_prompt;
        originalTokens = data.total_original_tokens || this.estimateTokens(prompt);
        compressedTokens = data.total_compressed_tokens || this.estimateTokens(compressedPrompt);
        console.log('✅ Extracted from root compressed_prompt');
      } else {
        console.warn('⚠️  Could not find compressed_prompt in response, using original');
      }
      
      const result: CompressionResult = {
        compressed_prompt: compressedPrompt,
        original_tokens: originalTokens,
        compressed_tokens: compressedTokens,
        compression_ratio: compressedTokens / originalTokens,
      };

      console.log('\n📊 COMPRESSION RESULTS:');
      console.log('  Original tokens:', originalTokens);
      console.log('  Compressed tokens:', compressedTokens);
      console.log('  Tokens saved:', originalTokens - compressedTokens);
      console.log('  Compression ratio:', (result.compression_ratio * 100).toFixed(1) + '%');
      console.log('  Savings:', ((1 - result.compression_ratio) * 100).toFixed(1) + '%');
      console.log('');

      // Cache the result
      this.cache.set(cacheKey, result);

      // Limit cache size
      if (this.cache.size > 100) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      return result;
    } catch (error) {
      console.error('❌ ScaleDown compression exception:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      console.warn('⚠️  Falling back to uncompressed prompt');
      
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
    console.log('🗑️  ScaleDown cache cleared');
  }
}