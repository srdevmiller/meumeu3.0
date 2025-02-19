import { Brain, Coffee, Fire, Info, Leaf, Star, ForkKnife } from "@phosphor-icons/react";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { cn } from "@/lib/utils";

export interface SuggestionType {
  type: 'popular' | 'healthy' | 'spicy' | 'vegetarian' | 'chefs-choice' | 'new' | 'premium' | 'out-of-stock';
  color?: string;
}

interface SuggestionInfo {
  type: SuggestionType['type'];
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}

const suggestionTypes: Record<SuggestionType['type'], SuggestionInfo> = {
  'popular': {
    type: 'popular',
    icon: <Fire size={16} />,
    label: 'Mais Pedido',
    description: 'Este item é um dos mais populares do nosso cardápio',
    color: 'text-orange-500'
  },
  'healthy': {
    type: 'healthy',
    icon: <Leaf size={16} />,
    label: 'Saudável',
    description: 'Opção mais leve e nutritiva',
    color: 'text-green-500'
  },
  'spicy': {
    type: 'spicy',
    icon: <Fire size={16} />,
    label: 'Picante',
    description: 'Este prato contém ingredientes picantes',
    color: 'text-red-500'
  },
  'vegetarian': {
    type: 'vegetarian',
    icon: <Leaf size={16} />,
    label: 'Vegetariano',
    description: 'Prato 100% vegetariano',
    color: 'text-emerald-500'
  },
  'chefs-choice': {
    type: 'chefs-choice',
    icon: <ForkKnife size={16} />,
    label: 'Sugestão do Chef',
    description: 'Recomendação especial do nosso chef',
    color: 'text-purple-500'
  },
  'new': {
    type: 'new',
    icon: <Star size={16} />,
    label: 'Novidade',
    description: 'Item recém adicionado ao cardápio',
    color: 'text-blue-500'
  },
  'premium': {
    type: 'premium',
    icon: <Coffee size={16} />,
    label: 'Premium',
    description: 'Item especial com ingredientes selecionados',
    color: 'text-yellow-500'
  },
  'out-of-stock': {
    type: 'out-of-stock',
    icon: <Info size={16} />,
    label: 'Em Falta',
    description: 'Este item está temporariamente indisponível',
    color: 'text-gray-500'
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
          <Badge 
            variant="outline" 
            className={cn(
              "cursor-help transition-all duration-200 inline-flex items-center px-2 py-0.5 text-xs hover:scale-110 hover:shadow-md",
              suggestion.color,
              "hover:bg-white dark:hover:bg-gray-800",
              "active:scale-95",
              className
            )}
          >
            <span className="transition-transform duration-200 group-hover:rotate-12">
              {suggestion.icon}
            </span>
            <span className="ml-1 whitespace-nowrap">{suggestion.label}</span>
          </Badge>
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
    <div className={cn("flex flex-wrap gap-1.5 items-center group", className)}>
      <Info size={16} className="text-muted-foreground flex-shrink-0 transition-transform duration-200 group-hover:rotate-12" />
      {suggestions.map((type) => (
        <SuggestionBadge key={type} type={type as SuggestionType['type']} />
      ))}
    </div>
  );
}