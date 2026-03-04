import * as tf from '@tensorflow/tfjs';
import { WoundClassificationResult, SimilarWound, ClassificationConfig } from '../types/classification';

class WoundClassificationService {
    private model: tf.GraphModel | null = null;
    private isModelLoaded: boolean = false;
    private config: ClassificationConfig = {
        modelPath: '/models/wound-classifier/model.json',
        inputSize: 224, // Adjust if your model uses different size
        labels: [
            'Healing Status',
            'Infection Risk Assessment',
            'Urgency Level',
            'Delay Healing'
        ],
        similarityThreshold: 0.7,
        maxSimilarImages: 5
    };

    // Reference dataset embeddings (pre-computed or loaded)
    private referenceDataset: Array<{
        id: string;
        embedding: number[];
        imageUrl: string;
        woundType: string;
        metadata?: any;
    }> = [];

    /**
     * Initialize and load the TensorFlow.js model
     */
    async initialize(): Promise<void> {
        try {
            console.log('Loading wound classification model...');

            // Load the model
            this.model = await tf.loadGraphModel(this.config.modelPath);

            // Warm up the model with a dummy prediction
            const warmupTensor = tf.zeros([1, this.config.inputSize, this.config.inputSize, 3]);
            const warmupResult = this.model.predict(warmupTensor) as tf.Tensor;
            warmupResult.dispose();
            warmupTensor.dispose();

            this.isModelLoaded = true;
            console.log('Model loaded successfully!');

            // Load reference dataset embeddings
            await this.loadReferenceDataset();

        } catch (error) {
            console.error('Failed to load classification model:', error);
            throw new Error('Model initialization failed. Please check if model files exist.');
        }
    }

    /**
     * Load reference dataset for similarity search
     */
    private async loadReferenceDataset(): Promise<void> {
        try {
            // Option 1: Load pre-computed embeddings from JSON
            const response = await fetch('/data/reference-embeddings.json');
            if (response.ok) {
                this.referenceDataset = await response.json();
                console.log(`Loaded ${this.referenceDataset.length} reference wound images`);
            }
        } catch (error) {
            console.warn('Could not load reference dataset:', error);
            // Continue without reference dataset
        }
    }

    /**
     * Classify a wound image
     */
    async classifyWound(imageData: string): Promise<WoundClassificationResult> {
        if (!this.isModelLoaded) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = async () => {
                try {
                    // Preprocess image
                    const tensor = await this.preprocessImage(img);

                    // Run inference
                    const predictions = this.model!.predict(tensor) as tf.Tensor;
                    const probabilities = await predictions.data();

                    // Get top predictions
                    const topPredictions = this.getTopPredictions(probabilities as Float32Array);

                    // Extract features for similarity search (use second-to-last layer)
                    const features = await this.extractFeatures(tensor);

                    // Find similar images
                    const similarImages = this.findSimilarImages(features);

                    // Clean up tensors
                    tensor.dispose();
                    predictions.dispose();

                    resolve({
                        predictedClass: topPredictions[0].className,
                        classLabel: topPredictions[0].className,
                        confidence: Math.round(topPredictions[0].probability * 100),
                        probabilities: topPredictions,
                        similarImages,
                        features,
                        timestamp: new Date()
                    });

                } catch (error) {
                    console.error('Classification error:', error);
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = imageData;
        });
    }

    /**
     * Preprocess image to match model input requirements
     */
    private async preprocessImage(img: HTMLImageElement): Promise<tf.Tensor> {
        return tf.tidy(() => {
            // Convert image to tensor
            let tensor = tf.browser.fromPixels(img);

            // Resize to model input size
            tensor = tf.image.resizeBilinear(tensor, [this.config.inputSize, this.config.inputSize]);

            // Normalize to [0, 1] or [-1, 1] depending on your model
            // Common normalization methods:

            // Option 1: Scale to [0, 1]
            tensor = tensor.div(255.0);

            // Option 2: Standardize (ImageNet normalization)
            // const mean = tf.tensor1d([0.485, 0.456, 0.406]);
            // const std = tf.tensor1d([0.229, 0.224, 0.225]);
            // tensor = tensor.sub(mean).div(std);

            // Add batch dimension [1, height, width, channels]
            tensor = tensor.expandDims(0);

            return tensor;
        });
    }

    /**
     * Extract feature embeddings from image
     */
    private async extractFeatures(tensor: tf.Tensor): Promise<number[]> {
        // If your model has multiple outputs, get the feature layer
        // Otherwise, use the predictions as features

        try {
            const predictions = this.model!.predict(tensor) as tf.Tensor;
            const features = await predictions.data();
            return Array.from(features);
        } catch (error) {
            console.error('Feature extraction error:', error);
            return [];
        }
    }

    /**
     * Find similar images using cosine similarity
     */
    private findSimilarImages(queryFeatures: number[]): SimilarWound[] {
        if (this.referenceDataset.length === 0 || queryFeatures.length === 0) {
            return [];
        }

        const similarities = this.referenceDataset.map(ref => ({
            ...ref,
            similarity: this.cosineSimilarity(queryFeatures, ref.embedding)
        }));

        // Sort by similarity and filter by threshold
        return similarities
            .filter(item => item.similarity >= this.config.similarityThreshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, this.config.maxSimilarImages)
            .map(item => ({
                id: item.id,
                imageUrl: item.imageUrl,
                woundType: item.woundType,
                similarity: item.similarity,
                metadata: item.metadata
            }));
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (normA * normB);
    }

    /**
     * Get top K predictions
     */
    private getTopPredictions(probabilities: Float32Array, k: number = 3): Array<{
        className: string;
        probability: number;
    }> {
        // Create array of [index, probability] pairs
        const indexed = Array.from(probabilities).map((prob, idx) => ({
            className: this.config.labels[idx] || `Class ${idx}`,
            probability: prob
        }));

        // Sort by probability descending
        indexed.sort((a, b) => b.probability - a.probability);

        // Return top k
        return indexed.slice(0, k);
    }

    /**
     * Update configuration
     */
    setConfig(config: Partial<ClassificationConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get current configuration
     */
    getConfig(): ClassificationConfig {
        return { ...this.config };
    }

    /**
     * Check if model is loaded
     */
    isReady(): boolean {
        return this.isModelLoaded;
    }

    /**
     * Dispose of model and free memory
     */
    dispose(): void {
        if (this.model) {
            this.model.dispose();
            this.model = null;
            this.isModelLoaded = false;
        }
    }
}

export const woundClassificationService = new WoundClassificationService();
