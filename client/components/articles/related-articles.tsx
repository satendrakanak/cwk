"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ArrowRight } from "lucide-react";

import { Article } from "@/types/article";
import { ArticleCard } from "./article-card";

interface RelatedArticlesProps {
  articles: Article[];
}

export const RelatedArticles = ({ articles }: RelatedArticlesProps) => {
  if (!articles?.length) return null;

  return (
    <section className="py-16">
      <div className="academy-card p-5 md:p-6">
        <div className="mb-8 flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Keep Reading
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-card-foreground lg:text-3xl">
              Related Articles
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Explore more reads connected to this topic.
            </p>
          </div>

          <div className="hidden items-center gap-2 text-sm font-semibold text-primary md:flex">
            Swipe to explore
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        <div className="related-articles-slider">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 1.08, spaceBetween: 14 },
              640: { slidesPerView: 2, spaceBetween: 18 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 20 },
            }}
          >
            {articles.map((article) => (
              <SwiperSlide key={article.id} className="h-auto">
                <div className="h-full pb-2">
                  <ArticleCard article={article} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};
