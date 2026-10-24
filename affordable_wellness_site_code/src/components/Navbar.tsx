import affordableWellnessLogo from "@/assets/affordable-wellness-logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { mergeAffiliateIntoSearch } from "@/lib/affiliateTracking";
import PageContainer from "@/components/layout/PageContainer";

const navLinks = [
  { label: "Treatments", hash: "pricing" },
  { label: "How it Works", hash: "how-it-works" },
  { label: "About Us", hash: "faq" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const funnelSearch = mergeAffiliateIntoSearch(search);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white">
      <PageContainer variant="nav">
        <div className="relative flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center shrink-0 z-10">
            <img
              src={affordableWellnessLogo}
              alt="Affordable Wellness"
              className="h-10 w-auto max-w-[140px] max-lg:h-8 max-lg:max-w-[110px] object-contain object-left"
            />
          </Link>

          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={{ pathname: "/", hash: link.hash }}
                className="inline-flex items-center gap-2 text-base font-medium text-[#121212] tracking-[-0.01em] hover:opacity-70 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-end gap-0 z-10 shrink-0">
            <button
              type="button"
              onClick={() =>
                window.open("https://member.affordablewellness.com/", "_blank")
              }
              className="inline-flex items-center justify-center h-10 px-5 max-lg:px-3 rounded-full text-sm font-semibold text-[#121212] tracking-[-0.01em] hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate("/questionnaire" + funnelSearch)}
              className="inline-flex items-center justify-center h-10 px-5 max-lg:px-3 rounded-full bg-[#2D476F] text-sm font-semibold text-white tracking-[-0.01em] hover:bg-[#243d5f] transition-colors ml-0 whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>
      </PageContainer>
    </nav>
  );
};

export default Navbar;
