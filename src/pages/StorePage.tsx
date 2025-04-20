import React from "react";
import StoreList from "@/components/store/StoreList";

export interface StoreItem {
  id: string;
  title: string;
  description: string;
  price: number;
  type: "theme" | "avatar" | "badge" | "feature";
  iconUrl: string;
  isPurchased: boolean;
  isLocked: boolean;
  isActive?: boolean;
  unlockRequirement?: {
    type: "level" | "badges" | "tasks";
    value: number;
  };
}

const storeItems: StoreItem[] = [
  {
    id: "1",
    title: "Feature A",
    description: "This feature allows you to do X.",
    iconUrl: `https://placehold.co/80`, // Cập nhật iconUrl
    type: "feature",
    price: 50,
    isPurchased: false,
    isLocked: false,
  },
  {
    id: "2",
    title: "Avatar B",
    description: "A cool avatar for your profile.",
    iconUrl: `https://placehold.co/80`, // Đã đúng
    type: "avatar",
    price: 30,
    isPurchased: false,
    isLocked: false,
  },
  {
    id: "3",
    title: "Badge C",
    description: "Earn this badge for completing tasks.",
    iconUrl: `https://placehold.co/80`, // Cập nhật iconUrl
    type: "badge",
    price: 20,
    isPurchased: false,
    isLocked: false,
  },
  {
    id: "4",
    title: "Theme D",
    description: "A new theme for your app.",
    iconUrl: `https://placehold.co/80`, // Cập nhật iconUrl
    type: "theme",
    price: 40,
    isPurchased: false,
    isLocked: false,
  },
];

// Mock handlers
const handlePurchase = (id: string) => {
  console.log(`Purchased item with id: ${id}`);
};

const handleUse = (id: string) => {
  console.log(`Used item with id: ${id}`);
};

const StorePage: React.FC = () => {

  return (
    <div className={`px-4 py-6 mx-auto`}>
      <StoreList
        items={storeItems}
        onPurchase={handlePurchase}
        onUse={handleUse}
      />

      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          Complete tasks and daily challenges to earn more tokens!
        </p>
      </div>
    </div>
  );
};

export default StorePage;
