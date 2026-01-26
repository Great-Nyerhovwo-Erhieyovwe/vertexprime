import { Hero } from "../../components/Hero/Hero";
import { TrustStrip } from "../../components/TrustStrip/TrustStrip";
import { MarketPreview } from "../../components/MarketPreview/MarketPreview";
import { WhyChoose } from "../../components/WhyChoose/WhyChoose";
import { HowItWorks } from "../../components/HowItWorks/HowItWorks";
import { AccountLevels } from "../../components/AccountLevels/AccountLevels";
import { DashboardMock } from "../../components/PlatformPreview/DashboardMock";
import { Testimonials } from "../../components/Testimonials/Testimonials";
import { FinalCTA } from "../../components/FinalCTA/FinalCTA";
import { Footer } from "../../components/Footer/Footer";

export const Home = () => {
    return (
        <>
            <Hero />
            <TrustStrip />
            <MarketPreview />
            <WhyChoose />
            <HowItWorks />
            <AccountLevels />
            <DashboardMock />
            <Testimonials />
            <FinalCTA />
            <Footer />
        </>
    );
};

export default Home;