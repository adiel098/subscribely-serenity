
import { useNavigate } from "react-router-dom";
import { Button } from "@/features/community/components/ui/button";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Manage Your Community With Ease
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Connect your social platform, manage subscriptions, and grow your community all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button onClick={() => navigate("/select-platform")} size="lg">
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/about")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
