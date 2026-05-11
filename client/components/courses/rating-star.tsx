"use client";

interface RatingStarsProps {
  rating: number;
}
const StarFullIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-yellow-500 mr-1"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 2l2.35 5.717h5.886a.667.667 0 0 1 .369 1.222l-4.777 3.752 1.974 5.829a.667.667 0 0 1-1.008.75L10 15.134l-5.794 3.136a.667.667 0 0 1-1.008-.75l1.974-5.829L1.793 8.939a.667.667 0 0 1 .37-1.222h5.886L10 2z"
      clipRule="evenodd"
    />
  </svg>
);
const StarHalfIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-yellow-500 mr-1"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <defs>
      <linearGradient id="halfStarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="50%" stopColor="yellow" />
        <stop offset="50%" stopColor="grey" />
      </linearGradient>
    </defs>
    <path
      fill="url(#halfStarGradient)"
      fillRule="evenodd"
      d="M10 2l2.35 5.717h5.886a.667.667 0 0 1 .369 1.222l-4.777 3.752 1.974 5.829a.667.667 0 0 1-1.008.75L10 15.134l-5.794 3.136a.667.667 0 0 1-1.008-.75l1.974-5.829L1.793 8.939a.667.667 0 0 1 .37-1.222h5.886L10 2z"
      clipRule="evenodd"
    />
  </svg>
);
const RatingStars = ({ rating }: RatingStarsProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars !== 0;

  const fullStarComponents = Array.from({ length: fullStars }, (_, index) => (
    <StarFullIcon key={index} />
  ));

  if (hasHalfStar) {
    fullStarComponents.push(<StarHalfIcon key="half-star" />);
  }

  return <div className="flex">{fullStarComponents}</div>;
};

export default RatingStars;
