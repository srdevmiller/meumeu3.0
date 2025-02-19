export type SuggestionType = 'popular' | 'healthy' | 'spicy' | 'vegetarian' | 'chefs-choice' | 'new' | 'premium' | 'out-of-stock';

export interface SuggestionData {
  type: SuggestionType;
  color?: string;
}