import CallList from "@/components/CallList";

const PreviousPage = () => {
  return (
    <section className="flex size-full flex-col gap-10 text-[#f4e1ff] px-6">
      <h1 className="text-4xl font-extrabold text-[#ffd700]">Previous Calls</h1>
      <CallList type="ended" />
    </section>
  );
};

export default PreviousPage;
