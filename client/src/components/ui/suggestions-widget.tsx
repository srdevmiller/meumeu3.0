import { Brain, Coffee, Fire, Info, Leaf, Star, ForkKnife } from "@phosphor-icons/react";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { cn } from "@/lib/utils";

export type SuggestionType = 'popular' | 'healthy' | 'spicy' | 'vegetarian' | 'chefs-choice' | 'new' | 'premium';

interface SuggestionInfo {
  id: string;
  type: SuggestionType;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}

const suggestionTypes: Record<SuggestionType, SuggestionInfo> = {
  'popular': {
    id: 'popular',
    type: 'popular',
    icon: <Fire size={16} />,
    label: 'Mais Pedido',
    description: 'Este item é um dos mais populares do nosso cardápio',
    color: 'text-orange-500'
  },
  'healthy': {
    id: 'healthy',
    type: 'healthy',
    icon: <Leaf size={16} />,
    label: 'Saudável',
    description: 'Opção mais leve e nutritiva',
    color: 'text-green-500'
  },
  'spicy': {
    id: 'spicy',
    type: 'spicy',
    icon: <Fire size={16} />,
    label: 'Picante',
    description: 'Este prato contém ingredientes picantes',
    color: 'text-red-500'
  },
  'vegetarian': {
    id: 'vegetarian',
    type: 'vegetarian',
    icon: <Leaf size={16} />,
    label: 'Vegetariano',
    description: 'Prato 100% vegetariano',
    color: 'text-emerald-500'
  },
  'chefs-choice': {
    id: 'chefs-choice',
    type: 'chefs-choice',
    icon: <ForkKnife size={16} />,
    label: 'Sugestão do Chef',
    description: 'Recomendação especial do nosso chef',
    color: 'text-purple-500'
  },
  'new': {
    id: 'new',
    type: 'new',
    icon: <Star size={16} />,
    label: 'Novidade',
    description: 'Item recém adicionado ao cardápio',
    color: 'text-blue-500'
  },
  'premium': {
    id: 'premium',
    type: 'premium',
    icon: <Coffee size={16} />,
    label: 'Premium',
    description: 'Item especial com ingredientes selecionados',
    color: 'text-yellow-500'
  }
};

interface SuggestionBadgeProps {
  type: SuggestionType;
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
              "cursor-help transition-colors",
              suggestion.color,
              className
            )}
          >
            {suggestion.icon}
            <span className="ml-1">{suggestion.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{suggestion.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface SuggestionsWidgetProps {
  suggestions: SuggestionType[];
  className?: string;
}

export function SuggestionsWidget({ suggestions, className }: SuggestionsWidgetProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Info size={20} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground mr-4">Informações do Item:</p>
          {suggestions.map((type) => (
            <SuggestionBadge key={type} type={type} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}