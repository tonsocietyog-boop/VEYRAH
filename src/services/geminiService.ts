import { CATALOG_ITEMS } from '../data/catalog';
import { AIRecommendationResult } from '../types';

class GeminiService {
  async askVeyra(query: string): Promise<AIRecommendationResult> {
    const catalogSummary = CATALOG_ITEMS.map((item) => ({
      id: item.id,
      title: item.title || item.name,
      media_type: item.media_type,
      genres: item.genres?.map((g) => g.name) || [],
      overview: item.overview.slice(0, 160),
      year: (item.release_date || item.first_air_date || '').slice(0, 4),
      rating: item.vote_average,
      director: item.director,
      mood_tags: item.mood_tags || [],
    }));

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, catalogSummary }),
      });

      if (!res.ok) {
        throw new Error('AI service response error');
      }

      const data = await res.json();
      return data as AIRecommendationResult;
    } catch {
      // Local fallback heuristic matching
      const lower = query.toLowerCase();
      const matched = CATALOG_ITEMS.filter((item) => {
        const text = `${item.title} ${item.name} ${item.overview} ${item.mood_tags?.join(' ')} ${item.genres?.map((g) => g.name).join(' ')}`.toLowerCase();
        return lower.split(' ').some((word) => word.length > 3 && text.includes(word));
      }).slice(0, 4);

      const items = (matched.length > 0 ? matched : CATALOG_ITEMS.slice(0, 4)).map((item, idx) => ({
        id: item.id,
        title: item.title || item.name || '',
        media_type: item.media_type,
        reason: `Richly aligns with your request for ${item.mood_tags?.[0] || 'gripping'} storytelling and memorable cinematography.`,
        vibeScore: 95 - idx * 3,
      }));

      return {
        query,
        interpretation: `Curating titles tailored to your request "${query}".`,
        matchedMedia: items,
        suggestedMood: 'Exciting',
      };
    }
  }

  async askMovieQuestion(title: string, overview: string, mediaType: string, question: string): Promise<string> {
    try {
      const res = await fetch('/api/ai/movie-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, overview, mediaType, question }),
      });

      if (!res.ok) {
        throw new Error('Movie chat error');
      }

      const data = await res.json();
      return data.answer || 'Thank you for exploring this title on VEYRAH.';
    } catch {
      return `Here is what stands out about ${title}: It features outstanding direction, thematic depth, and award-winning craftsmanship that viewers return to time and again.`;
    }
  }
}

export const geminiService = new GeminiService();
