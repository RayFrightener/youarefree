export default function MainView({ children }) {
  return (
    <div className="flex flex-col w-full max-w-3xl min-h-[80vh] bg-[#ECE9E9]/90 backdrop-blur border border-[#FFFFFF]/24 shadow-[0_40px_80px_-32px_rgba(0,0,0,0.45)] rounded-[36px] px-8 sm:px-14 py-16">
      {children}
    </div>
  );
}
