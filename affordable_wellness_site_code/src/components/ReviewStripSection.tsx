import AmyImage from "@/assets/AmyS.jpg";
import LizImage from "@/assets/LizSheridan.jpg";
import PageContainer from "@/components/layout/PageContainer";

const reviews = [
  {
    quote:
      "First time I saw exactly where every dollar was going before I paid anything.",
    name: "Sarah M.",
    image: AmyImage,
  },
  {
    quote:
      "Awesome Results! This is the first time in my life I've lost weight & kept it off.",
    name: "Angela T.",
    image: LizImage,
  },
  {
    quote:
      "I almost didn't sign up because the price felt too low. But they literally show you the cost breakdown line by line.",
    name: "Michael R.",
    image: null,
  },
];

const marqueeReviews = [...reviews, ...reviews];

const StarRating = () => (
  <div className="flex gap-0.5">
    {[...Array(4)].map((_, i) => (
      <span
        key={i}
        className="w-4 h-4 bg-[#2D476F]"
        style={{
          clipPath:
            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        }}
      />
    ))}
    <span
      className="w-4 h-4 border-[1.5px] border-[#2D476F] relative overflow-hidden"
      style={{
        clipPath:
          "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      }}
    >
      <span
        className="absolute inset-0 w-1/2 bg-[#2D476F]"
        style={{
          clipPath:
            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        }}
      />
    </span>
  </div>
);

const ReviewCard = ({
  review,
  index,
}: {
  review: (typeof reviews)[number];
  index: number;
}) => (
  <div
    className="shrink-0 w-[352px] min-h-[112px] bg-white border border-[#EFEFEF] rounded-xl p-5 flex flex-col justify-center gap-3"
    aria-hidden={index >= reviews.length ? true : undefined}
  >
    <p className="text-base font-medium leading-[1.5] text-[#121212] line-clamp-2">
      &ldquo;{review.quote}&rdquo;
    </p>
    <div className="flex items-center gap-3">
      {review.image ? (
        <img
          src={review.image}
          alt={review.name}
          className="w-7 h-7 rounded-full object-cover"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-[#121212]">
          {review.name[0]}
        </div>
      )}
      <StarRating />
    </div>
  </div>
);

const ReviewStripSection = () => (
  <section className="bg-white pb-6 md:pb-8">
    {/* <PageContainer variant="hero">
      <div className="flex flex-col lg:flex-row items-stretch gap-5 min-h-[112px] py-0">
        <h2 className="text-2xl font-medium leading-[1.5] tracking-[-0.01em] text-[#121212] max-w-[413px] shrink-0 flex items-center">
          What people are saying about Affordable Wellness
        </h2>
        <div className="relative flex-1 min-w-0 overflow-hidden">
          <div className="flex gap-5 w-max animate-review-marquee">
            {marqueeReviews.map((review, index) => (
              <ReviewCard
                key={`${review.name}-${index}`}
                review={review}
                index={index}
              />
            ))}
          </div>
          <div
            className="pointer-events-none absolute right-0 top-0 w-[100px] h-full z-10"
            style={{
              background:
                "linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
            }}
          />
        </div>
      </div>
    </PageContainer> */}
  </section>
);

export default ReviewStripSection;
