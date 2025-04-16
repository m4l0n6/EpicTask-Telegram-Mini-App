
import React from 'react';
import StoreItem, { StoreItemProps } from './StoreItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type StoreItemType = Omit<StoreItemProps, 'onPurchase' | 'onUse'>;

interface StoreListProps {
  items: StoreItemType[];
  onPurchase: (id: string) => void;
  onUse: (id: string) => void;
}

const StoreList: React.FC<StoreListProps> = ({ items, onPurchase, onUse }) => {

  
  // Count the number of items per category
  const featureCount = items.filter(item => item.type === 'feature').length;
  const avatarCount = items.filter(item => item.type === 'avatar').length;
  const badgeCount = items.filter(item => item.type === 'badge').length;
  const themeCount = items.filter(item => item.type === 'theme').length;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl">Store</h2>
          <div className="flex items-center">
            <span className="mr-2 text-muted-foreground">Your tokens:</span>
            <Badge variant="outline" className="flex items-center bg-amber-50 border-amber-200 text-amber-700">
              <span className="font-bold">100</span>
            </Badge>
          </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="features" className="flex-1">
            Features <Badge variant="secondary" className="ml-1">{featureCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="avatars" className="flex-1">
            Avatars <Badge variant="secondary" className="ml-1">{avatarCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex-1">
            Badges <Badge variant="secondary" className="ml-1">{badgeCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex-1">
            Themes <Badge variant="secondary" className="ml-1">{themeCount}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className={`grid  grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`}>
            {items.map(item => (
              <StoreItem 
                key={item.id}
                {...item}
                onPurchase={onPurchase}
                onUse={onUse}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="features" className="mt-4">
          <div className={`grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`}>
            {items
              .filter(item => item.type === 'feature')
              .map(item => (
                <StoreItem 
                  key={item.id}
                  {...item}
                  onPurchase={onPurchase}
                  onUse={onUse}
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="avatars" className="mt-4">
          <div className={`grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`}>
            {items
              .filter(item => item.type === 'avatar')
              .map(item => (
                <StoreItem 
                  key={item.id}
                  {...item}
                  onPurchase={onPurchase}
                  onUse={onUse}
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="badges" className="mt-4">
          <div className={`grid grid-cols-2' : 'grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`}>
            {items
              .filter(item => item.type === 'badge')
              .map(item => (
                <StoreItem 
                  key={item.id}
                  {...item}
                  onPurchase={onPurchase}
                  onUse={onUse}
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="themes" className="mt-4">
          <div className={`grid grid-cols-2' : 'grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`}>
            {items
              .filter(item => item.type === 'theme')
              .map(item => (
                <StoreItem 
                  key={item.id}
                  {...item}
                  onPurchase={onPurchase}
                  onUse={onUse}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreList;
