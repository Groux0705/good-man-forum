import api from '../utils/api';

export interface TopicInteractionData {
  liked: boolean;
  favorited: boolean;
  likes: number;
  favorites: number;
}

export interface TopicInteractionResult {
  action: 'liked' | 'unliked' | 'favorited' | 'unfavorited';
  liked?: boolean;
  favorited?: boolean;
  likes: number;
  favorites?: number;
}

class TopicInteractionService {
  async likeTopic(topicId: string): Promise<TopicInteractionResult> {
    const response = await api.post(`/topic-interactions/${topicId}/like`);
    return response.data.data;
  }

  async favoriteTopic(topicId: string): Promise<TopicInteractionResult> {
    const response = await api.post(`/topic-interactions/${topicId}/favorite`);
    return response.data.data;
  }

  async getTopicInteractions(topicId: string): Promise<TopicInteractionData> {
    const response = await api.get(`/topic-interactions/${topicId}/interactions`);
    return response.data.data;
  }

  async getUserLikedTopics(page = 1, limit = 20) {
    const response = await api.get(`/topic-interactions/liked?page=${page}&limit=${limit}`);
    return response.data.data;
  }

  async getUserFavoriteTopics(page = 1, limit = 20) {
    const response = await api.get(`/topic-interactions/favorited?page=${page}&limit=${limit}`);
    return response.data.data;
  }
}

export const topicInteractionService = new TopicInteractionService();