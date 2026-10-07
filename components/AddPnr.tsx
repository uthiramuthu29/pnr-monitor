import PageHeading from "@/components/PageHeading";
import StepsCard from "@/components/StepsCard";

export default function AddPnr() {
  return (
    <div className="absolute top-0 z-40 bg-[rgb(250,248,255)] h-full w-full ">
      <PageHeading
        title="Add New PNR"
        desc="Start automated polling & instant alerts on berth or RAC changes."
      />
      <StepsCard title="Enter 10-Digit PNR" number={1} />
      <StepsCard
        title="Check Frequency"
        desc="How frequently should we query chart preparation & RAC movement?"
        number={2}
      />
      <StepsCard
        title="Recipients"
        desc="Instant WhatsApp and SMS ping when chart prepares or berth is alloted."
        number={3}
      />
    </div>
  );
}
