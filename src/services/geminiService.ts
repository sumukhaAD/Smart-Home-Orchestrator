import type { AIResponse, Device, Room } from '../types';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private generateSystemPrompt(rooms: Room[], devices: Device[]): string {
    const roomDeviceMap = rooms.map((room) => ({
      room: room.slug,
      name: room.name,
      devices: devices
        .filter((d) => d.room_id === room.id)
        .map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          current_status: d.status,
        })),
    }));

    return `You are an intelligent home automation assistant controlling a smart home. You have access to these rooms and devices:

${JSON.stringify(roomDeviceMap, null, 2)}

CRITICAL INSTRUCTIONS:
1. Respond ONLY with valid JSON in this exact format:
{
  "actions": [
    {"device_id": "uuid", "status": {"state": "on", "brightness": 80}},
    {"device_id": "uuid", "status": {"state": "off"}}
  ],
  "confirmation": "I've turned on the living room lights at 80% brightness.",
  "suggestions": ["Would you like me to close the blinds as well?"]
}

2. Interpret natural language flexibly:
   - "make it cooler" = lower AC temperature by 2-3°C
   - "movie mode" = dim lights to 20-30%, turn on TV, close blinds
   - "goodnight" = turn off most lights, close curtains, enable security
   - "I'm cold" = increase AC temperature or turn on heater
   - "turn on lights" = set brightness to 80-100%
   - "dim lights" = set brightness to 20-30%
   - "bright" = set brightness to 100%

3. Always use the actual device_id from the provided device list in your actions.

4. For device status:
   - Lights: state can be "off", "on", brightness 0-100
   - TV: state "off"/"on", volume 0-100
   - AC: state "off"/"on", temperature 16-30, mode "cool"/"heat"/"fan"
   - Curtains/Blinds: state "open"/"closed", percentage 0-100
   - Fan: state "off"/"on", speed 0-100
   - Other devices: typically just state "off"/"on"

5. Handle ambiguous commands by asking for clarification in the confirmation message.

6. For impossible actions (device doesn't exist, invalid operation), explain why in confirmation with empty actions array.

7. Suggest related actions that might improve comfort or efficiency.

8. Common scenes:
   - "movie mode": dim living room lights, turn on TV, close blinds
   - "sleep mode" / "goodnight": turn off most lights, close bedroom curtains
   - "good morning": open curtains, turn on lights, start coffee maker
   - "I'm hot": lower AC temperature or increase fan speed
   - "I'm cold": increase AC temperature or turn on heater
   - "party mode": bright lights, turn on speakers/TV
   - "work mode": turn on office lights and PC`;
  }

  async processCommand(
    command: string,
    rooms: Room[],
    devices: Device[],
    scaleDownEnabled: boolean = false,
    compressPromptFn?: (text: string) => Promise<string>
  ): Promise<AIResponse> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('Gemini API key is not configured');
    }

    const systemPrompt = this.generateSystemPrompt(rooms, devices);
    const fullPrompt = `${systemPrompt}\n\nUser Command: "${command}"\n\nRespond with JSON only:`;

    console.log('=== TOKEN COMPRESSION ANALYSIS ===');
    console.log('📝 Original Prompt Length:', fullPrompt.length, 'characters');
    console.log('\n📊 Original Stats:');
    const originalTokens = this.estimateTokens(fullPrompt);
    const originalChars = fullPrompt.length;
    console.log(`  Characters: ${originalChars}`);
    console.log(`  Estimated Tokens: ${originalTokens}`);

    let finalPrompt = fullPrompt;
    let compressedTokens = originalTokens;
    let compressionRatio = 0;

 // Apply compression if enabled
if (scaleDownEnabled) {
  try {
    console.log('\n🔄 Compression: ENABLED (Local compression - conservative mode)');
    console.log('⏳ Applying compression...');
    
    const compressionStartTime = performance.now();
    
    // More conservative compression - only remove whitespace
    const compressedPrompt = fullPrompt
      .replace(/\n\n\n+/g, '\n\n')     // Remove triple+ newlines only
      .replace(/   +/g, '  ')           // Remove excessive spaces (3+ → 2)
      .trim();
    
    finalPrompt = compressedPrompt;
    
    const compressionEndTime = performance.now();
    
    compressedTokens = this.estimateTokens(finalPrompt);
    const compressedChars = finalPrompt.length;
    compressionRatio = ((originalTokens - compressedTokens) / originalTokens) * 100;
    
    console.log('\n✅ Compression Complete!');
    console.log('📊 Compressed Stats:');
    console.log(`  Characters: ${compressedChars} (${((compressedChars / originalChars) * 100).toFixed(1)}% of original)`);
    console.log(`  Estimated Tokens: ${compressedTokens}`);
    console.log(`  Compression Time: ${(compressionEndTime - compressionStartTime).toFixed(2)}ms`);
    console.log('\n💾 Token Savings:');
    console.log(`  Tokens Saved: ${originalTokens - compressedTokens}`);
    console.log(`  Compression Ratio: ${compressionRatio.toFixed(2)}%`);
  } catch (error) {
    console.error('❌ Compression failed:', error);
    console.log('⚠️  Falling back to original prompt');
    finalPrompt = fullPrompt;
    compressedTokens = originalTokens;
  }
} else {
  console.log('\n🔄 Compression: DISABLED');
  console.log('ℹ️  Using original prompt without compression');
}

    console.log('\n=== END TOKEN ANALYSIS ===\n');

    try {
      const request: GeminiRequest = {
        contents: [
          {
            role: 'user',
            parts: [{ text: finalPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      };

      console.log('🚀 Sending request to Gemini API...');
      const apiStartTime = performance.now();

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const apiEndTime = performance.now();
      console.log(`✅ Gemini API Response Time: ${(apiEndTime - apiStartTime).toFixed(2)}ms`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Gemini API Error:', response.status, errorData);
        throw new Error(
          `Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        console.error('❌ No candidates in Gemini response:', data);
        throw new Error('No response from Gemini API');
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      console.log('📥 Gemini Response:', textResponse);

      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ Invalid response format - no JSON found');
        throw new Error('Invalid response format from AI');
      }

      const aiResponse: AIResponse = JSON.parse(jsonMatch[0]);
      console.log('✅ Parsed AI Response:', aiResponse);

      if (!aiResponse.actions || !aiResponse.confirmation) {
        console.error('❌ Incomplete AI response:', aiResponse);
        throw new Error('Incomplete AI response');
      }

      // Log final statistics
      console.log('\n📊 FINAL REQUEST STATISTICS:');
      console.log(`  Input Tokens: ${compressedTokens}`);
      console.log(`  Actions to Execute: ${aiResponse.actions.length}`);
      if (scaleDownEnabled && compressPromptFn) {
        console.log(`  Tokens Saved: ${originalTokens - compressedTokens} (${compressionRatio.toFixed(2)}%)`);
      }
      console.log('================================\n');

      return aiResponse;
    } catch (error) {
      console.error('❌ Error processing command:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to process command with AI');
    }
  }

  estimateTokens(text: string): number {
    // More accurate token estimation (roughly 1 token per 4 characters)
    return Math.ceil(text.length / 4);
  }
}