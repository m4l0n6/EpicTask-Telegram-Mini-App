
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StoreItemProps {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'theme' | 'avatar' | 'badge' | 'feature';
  iconUrl: string;
  isPurchased: boolean;
  isLocked: boolean;
  onPurchase: (id: string) => void;
  onUse: (id: string) => void;
}

const StoreItem: React.FC<StoreItemProps> = ({
  id,
  title,
  description,
  price,
  type,
  iconUrl,
  isPurchased,
  isLocked,
  onPurchase,
  onUse
}) => {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 border-2 h-72 relative",
        isPurchased ? "border-green-500/30 bg-green-50/10" : "",
        isLocked ? "border-gray-300 bg-gray-50/50" : ""
      )}
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-base">
          <span className="flex items-center">
            {type === "feature" && (
              <Sparkles className="mr-1 w-4 h-4 text-epic-purple" />
            )}
            {title}
          </span>
          <span className="flex items-center font-normal text-amber-500 text-sm">
            <img src='/token.png' className="mr-1 w-4 h-4" title='token'/>
            {price}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex justify-center mb-2">
          <div className="flex justify-center items-center bg-muted/20 rounded-full aspect-square text-3xl">
            <img src={iconUrl} alt="" />
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
      <CardFooter className='right-0 bottom-6 left-0 absolute flex justify-center items-center'>
        {isLocked ? (
          <Button disabled variant="outline" className="w-full" size="sm">
            <Lock className="mr-1 w-4 h-4" />
            Locked
          </Button>
        ) : isPurchased ? (
          <Button
            variant="outline"
            className="border-green-500 w-full text-green-600 cursor-pointer"
            size="sm"
            onClick={() => onUse(id)}
          >
            <Check className="mr-1 w-4 h-4" />
            Use
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full cursor-pointer"
            size="sm"
            onClick={() => onPurchase(id)}
          >
            Purchase
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default StoreItem;
