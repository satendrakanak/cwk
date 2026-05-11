"use client";

import { TagsForm } from "./tags-form";
import { CategoryForm } from "./category-form";
import QuickInfo from "./quick-info";
import { FeaturedImageForm } from "./featured-image-form";
import { Article } from "@/types/article";

interface RightSidebarProps {
  article: Article;
}

export const RightSidebar = ({ article }: RightSidebarProps) => {
  return (
    <div className="sticky top-24 space-y-4">
      {/* 🔥 Featured Image */}
      <FeaturedImageForm article={article} />
      {/* 🔥 Category */}
      <CategoryForm article={article} />

      {/* 🔥 Tags */}
      <TagsForm article={article} />

      {/* 🔥 Quick Info */}
      <QuickInfo article={article} />
    </div>
  );
};
