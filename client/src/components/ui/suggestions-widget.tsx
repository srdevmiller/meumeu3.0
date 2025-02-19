import { Brain, Coffee, Fire, Info, Leaf, Star, ForkKnife } from "@phosphor-icons/react";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { cn } from "@/lib/utils";

export interface SuggestionType {
  type: 'popular' | 'healthy' | 'spicy' | 'vegetarian' | 'chefs-choice' | 'new' | 'premium' | 'out-of-stock' | 'promotion';
  color?: string;
}

interface SuggestionInfo {
  type: SuggestionType['type'];
  icon: React.ReactNode;
  label: string;
  description: string;
  bgColor: string;
  textColor: string;
}

const suggestionTypes: Record<SuggestionType['type'], SuggestionInfo> = {
  'popular': {
    type: 'popular',
    icon: <Fire size={16} />,
    label: 'Mais Pedido',
    description: 'Este item é um dos mais populares do nosso cardápio',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  'premium': {
    type: 'premium',
    icon: <Coffee size={16} />,
    label: 'Premium',
    description: 'Item especial com ingredientes selecionados',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  'new': {
    type: 'new',
    icon: <Star size={16} />,
    label: 'Novidade',
    description: 'Item recém adicionado ao cardápio',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-600 dark:text-orange-400'
  },
  'out-of-stock': {
    type: 'out-of-stock',
    icon: <Info size={16} />,
    label: 'Em Falta',
    description: 'Este item está temporariamente indisponível',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-600 dark:text-red-400'
  },
  'promotion': {
    type: 'promotion',
    icon: <Star size={16} />,
    label: 'Promoção',
    description: 'Este item está em promoção',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-600 dark:text-green-400'
  }
};

interface SuggestionBadgeProps {
  type: SuggestionType['type'];
  className?: string;
}

export function SuggestionBadge({ type, className }: SuggestionBadgeProps) {
  const suggestion = suggestionTypes[type];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium cursor-help",
              "transition-all duration-200 hover:scale-105",
              suggestion.bgColor,
              suggestion.textColor,
              className
            )}
          >
            <span className="transition-transform duration-200 group-hover:rotate-12">
              {suggestion.icon}
            </span>
            <span>{suggestion.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent sideOffset={5} className="animate-in fade-in-0 zoom-in-95">
          <p>{suggestion.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface SuggestionsWidgetProps {
  suggestions: string[];
  className?: string;
}

export function SuggestionsWidget({ suggestions, className }: SuggestionsWidgetProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5 items-center", className)}>
      {suggestions.map((type) => (
        <SuggestionBadge key={type} type={type as SuggestionType['type']} />
      ))}
    </div>
  );
}