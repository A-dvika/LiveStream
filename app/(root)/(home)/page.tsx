import MeetingTypeList from '@/components/MeetingTypeList';

const Home = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);
  return (
    <section className="flex size-full flex-col gap-5 text-white animate-fade-in">
      <div className="h-[303px] w-full rounded-[20px] bg-hero bg-cover bg-gradient-to-r from-lavender-400 to-yellow-200 shadow-lg">
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <h2 className="glassmorphism max-w-[273px] rounded py-2 text-center text-base font-medium text-gray-900 bg-white/40 shadow-md">
            Upcoming Meeting at: 12:30 PM
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl text-gray-900 animate-bounce">
              {time}
            </h1>
            <p className="text-lg font-medium text-yellow-800 lg:text-2xl">{date}</p>
          </div>
        </div>
      </div>
  
      <MeetingTypeList />
    </section>
  );
  
};

export default Home;
