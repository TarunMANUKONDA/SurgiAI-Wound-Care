const API_URL = import.meta.env.VITE_API_HOST || 'http://localhost:8000';
// If the URL already contains http/https, use it directly. Otherwise, assume localhost and add protocol.
const BASE_URL = API_URL.startsWith('http') ? API_URL : `http://${API_URL}`;
const API_BASE_URL = `${BASE_URL}/api`;

export class BackendAPIService {
  async uploadImage(file: File, caseId?: string): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);
    if (caseId) {
      formData.append('case_id', caseId);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async classifyWound(woundId: number, similarLabel?: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wound_id: woundId,
          similar_label: similarLabel
        })
      });
      if (!response.ok) throw new Error(`Classification failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Classification error:', error);
      throw error;
    }
  }

  async getRecommendations(classificationId: number, woundType: string, confidence: number, symptoms?: any): Promise<any> {
    try {
      const body: any = { classification_id: classificationId, wound_type: woundType, confidence };
      if (symptoms) {
        Object.assign(body, symptoms);
      }
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`Recommendation failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Recommendation error:', error);
      throw error;
    }
  }

  async getHistory(userId: number = 1, caseId?: string): Promise<any> {
    try {
      let url = `${API_BASE_URL}/history?user_id=${userId}`;
      if (caseId) {
        url += `&case_id=${caseId}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error(`History fetch failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('History error:', error);
      throw error;
    }
  }

  async createCase(name: string, description?: string, userId: number = 1): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/create_case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, user_id: userId })
      });
      if (!response.ok) throw new Error(`Create case failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Create case error:', error);
      throw error;
    }
  }

  async getCases(userId: number = 1): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/cases?user_id=${userId}`); // Corrected endpoint for cases
      if (!response.ok) throw new Error(`Get cases failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Get cases error:', error);
      throw error;
    }
  }

  async saveComparison(caseId: string, woundIdBefore: string, woundIdAfter: string, analysis: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/save_comparison`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_id: caseId,
          wound_id_before: woundIdBefore,
          wound_id_after: woundIdAfter,
          analysis: analysis
        }),
      });
      if (!response.ok) throw new Error(`Save comparison failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Save comparison error:', error);
      throw error;
    }
  }

  async compareWounds(baseWoundId: string, currentWoundId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_wound_id: baseWoundId,
          current_wound_id: currentWoundId
        }),
      });
      if (!response.ok) throw new Error(`Comparison failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Comparison error:', error);
      throw error;
    }
  }

  async validateImage(imageData: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_data: imageData
        }),
      });
      if (!response.ok) throw new Error(`Validation failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Validation error:', error);
      throw error;
    }
  }

  async saveAnalysis(woundId: string, analysis: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/save_analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wound_id: woundId,
          analysis: analysis
        }),
      });
      if (!response.ok) throw new Error(`Save analysis failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Save analysis error:', error);
      throw error;
    }
  }

  async deleteWound(woundId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/wounds/${woundId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Delete wound failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Delete wound error:', error);
      throw error;
    }
  }

  async deleteCase(caseId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Delete case failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Delete case error:', error);
      throw error;
    }
  }
}

export const backendAPI = new BackendAPIService();

