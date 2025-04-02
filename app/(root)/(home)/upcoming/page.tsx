import CallList from '@/components/CallList';

const UpcomingPage = () => {
  return (
    <section className="flex size-full flex-col gap-10 text-lavender-100 px-6">
      <h1 className="text-4xl font-extrabold text-yellow-400 drop-shadow-md">
        Upcoming Meetings
      </h1>
      <CallList type="upcoming" />
    </section>
  );
};  

export default UpcomingPage;
