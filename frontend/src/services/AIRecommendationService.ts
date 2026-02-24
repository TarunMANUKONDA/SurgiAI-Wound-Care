import {
    AIRecommendation,
    AIAPIRequest,
    AIAPIResponse,
    AIAPIConfig,
    WoundClassificationResult
} from '../types/classification';

class AIRecommendationService {
    private config: AIAPIConfig = {
        provider: 'gemini',
        apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
        model: 'gemini-pro',
        temperature: 0.7,
        maxTokens: 1500
    };

    /**
     * Get AI-powered recommendations based on wound classification
     */
    async getRecommendations(request: AIAPIRequest): Promise<AIAPIResponse> {
        if (!this.config.apiKey) {
            return {
                success: false,
                error: 'API key not configured. Please set VITE_GEMINI_API_KEY in your .env file'
            };
        }

        try {
            const prompt = this.buildPrompt(request);

            let recommendation: AIRecommendation;

            switch (this.config.provider) {
                case 'openai':
                    recommendation = await this.getOpenAIRecommendation(prompt);
                    break;
                case 'gemini':
                    recommendation = await this.getGeminiRecommendation(prompt);
                    break;
                case 'custom':
                    recommendation = await this.getCustomAPIRecommendation(prompt, request);
                    break;
                default:
                    throw new Error(`Unknown provider: ${this.config.provider}`);
            }

            return {
                success: true,
                recommendation
            };

        } catch (error) {
            console.error('AI recommendation error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Build a comprehensive prompt for the AI
     */
    private buildPrompt(request: AIAPIRequest): string {
        const { woundType, classification, patientContext, existingAnalysis } = request;

        let prompt = `You are an expert wound care specialist. Provide detailed, medically-informed care recommendations for a patient.

**Wound Classification:**
- Type: ${woundType}
- Confidence: ${classification.confidence}%
- Alternative possibilities: ${classification.probabilities.slice(1, 3).map(p => `${p.className} (${Math.round(p.probability * 100)}%)`).join(', ')}
`;

        if (patientContext) {
            prompt += `\n**Patient Context:**`;
            if (patientContext.daysSinceSurgery) {
                prompt += `\n- Days since surgery/injury: ${patientContext.daysSinceSurgery}`;
            }
            if (patientContext.painLevel) {
                prompt += `\n- Pain level: ${patientContext.painLevel}`;
            }
            if (patientContext.hasFever !== undefined) {
                prompt += `\n- Fever present: ${patientContext.hasFever ? 'Yes' : 'No'}`;
            }
            if (patientContext.otherSymptoms && patientContext.otherSymptoms.length > 0) {
                prompt += `\n- Other symptoms: ${patientContext.otherSymptoms.join(', ')}`;
            }
        }

        if (existingAnalysis) {
            prompt += `\n\n**Image Analysis Results:**`;
            if (existingAnalysis.rednessLevel !== undefined) {
                prompt += `\n- Redness level: ${existingAnalysis.rednessLevel}%`;
            }
            if (existingAnalysis.swellingLevel !== undefined) {
                prompt += `\n- Swelling level: ${existingAnalysis.swellingLevel}%`;
            }
            if (existingAnalysis.healingStage) {
                prompt += `\n- Healing stage: ${existingAnalysis.healingStage}`;
            }
            if (existingAnalysis.riskLevel) {
                prompt += `\n- Risk level: ${existingAnalysis.riskLevel}`;
            }
        }

        prompt += `\n\n**Please provide:**
1. A brief summary of the wound type and current status
2. Detailed cleaning instructions (specific steps)
3. Dressing recommendations (type and frequency)
4. Medication suggestions if applicable
5. Expected healing timeline
6. Follow-up schedule recommendations
7. Warning signs to watch for
8. When to seek immediate medical help
9. Diet and nutrition advice
10. Activity restrictions and lifestyle recommendations

Format your response as a structured JSON object with the following keys:
- summary (string)
- detailedAdvice (array of strings)
- cleaningInstructions (array of strings)
- dressingRecommendations (array of strings)
- medicationSuggestions (array of strings, can be empty)
- expectedHealingTime (string)
- followUpSchedule (array of strings)
- warningsSigns (array of strings)
- whenToSeekHelp (array of strings)
- dietAdvice (array of strings)
- activityRestrictions (array of strings)
- confidence (number 0-100)

Be specific, actionable, and medically accurate. Include disclaimers where appropriate.`;

        return prompt;
    }

    /**
     * Get recommendations from OpenAI API
     */
    private async getOpenAIRecommendation(prompt: string): Promise<AIRecommendation> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert wound care specialist providing medical guidance. Always be thorough, accurate, and include appropriate disclaimers.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: this.config.temperature,
                max_tokens: this.config.maxTokens,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error: ${error}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse JSON response
        const parsed = JSON.parse(content);

        return {
            summary: parsed.summary || 'No summary available',
            detailedAdvice: parsed.detailedAdvice || [],
            cleaningInstructions: parsed.cleaningInstructions || [],
            dressingRecommendations: parsed.dressingRecommendations || [],
            medicationSuggestions: parsed.medicationSuggestions || [],
            expectedHealingTime: parsed.expectedHealingTime || 'Variable',
            followUpSchedule: parsed.followUpSchedule || [],
            warningsSigns: parsed.warningsSigns || [],
            whenToSeekHelp: parsed.whenToSeekHelp || [],
            dietAdvice: parsed.dietAdvice || [],
            activityRestrictions: parsed.activityRestrictions || [],
            confidence: parsed.confidence || 75,
            source: 'openai',
            timestamp: new Date()
        };
    }

    /**
     * Get recommendations from Google Gemini API
     */
    private async getGeminiRecommendation(prompt: string): Promise<AIRecommendation> {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || this.config.apiKey;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: this.config.temperature,
                        maxOutputTokens: this.config.maxTokens
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error: ${error}`);
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text;

        // Try to parse as JSON, or extract JSON from markdown code blocks
        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch {
            // Extract JSON from markdown code blocks
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[1]);
            } else {
                // Fallback: create structured response from text
                parsed = this.parseTextResponse(content);
            }
        }

        return {
            summary: parsed.summary || 'No summary available',
            detailedAdvice: parsed.detailedAdvice || [],
            cleaningInstructions: parsed.cleaningInstructions || [],
            dressingRecommendations: parsed.dressingRecommendations || [],
            medicationSuggestions: parsed.medicationSuggestions,
            expectedHealingTime: parsed.expectedHealingTime || 'Variable',
            followUpSchedule: parsed.followUpSchedule || [],
            warningsSigns: parsed.warningsSigns || [],
            whenToSeekHelp: parsed.whenToSeekHelp || [],
            dietAdvice: parsed.dietAdvice,
            activityRestrictions: parsed.activityRestrictions,
            confidence: parsed.confidence || 75,
            source: 'gemini',
            timestamp: new Date()
        };
    }

    /**
     * Get recommendations from custom API endpoint
     */
    private async getCustomAPIRecommendation(prompt: string, request: AIAPIRequest): Promise<AIRecommendation> {
        // Replace with your custom API endpoint
        const customEndpoint = import.meta.env.VITE_CUSTOM_API_ENDPOINT || '';

        const response = await fetch(customEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                woundType: request.woundType,
                classification: request.classification,
                patientContext: request.patientContext,
                prompt: prompt
            })
        });

        if (!response.ok) {
            throw new Error(`Custom API error: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            ...data,
            source: 'custom' as const,
            timestamp: new Date()
        };
    }

    /**
     * Fallback parser for text responses
     */
    private parseTextResponse(text: string): Partial<AIRecommendation> {
        // Basic text parsing - you can enhance this
        return {
            summary: text.split('\n\n')[0] || text.substring(0, 200),
            detailedAdvice: [text],
            cleaningInstructions: [],
            dressingRecommendations: [],
            expectedHealingTime: 'Variable',
            followUpSchedule: [],
            warningsSigns: [],
            whenToSeekHelp: [],
            confidence: 50
        };
    }

    /**
     * Update configuration
     */
    setConfig(config: Partial<AIAPIConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get current configuration (without exposing API key)
     */
    getConfig(): Omit<AIAPIConfig, 'apiKey'> {
        const { apiKey, ...safeConfig } = this.config;
        return safeConfig;
    }
}

export const aiRecommendationService = new AIRecommendationService();
