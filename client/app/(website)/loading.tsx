import { ListingPageSkeleton } from "@/components/skeletons/website-skeletons";

export default function Loading() {
  return <ListingPageSkeleton type="course" withStats count={6} />;
}
