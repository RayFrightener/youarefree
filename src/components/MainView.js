export default function MainView({ children }) {
    return (
    <div className="flex flex-col max-w-md w-full mx-auto rounded-2xl shadow-lg bg-[#DCD9D9] h-[calc(100vh-80px)] overflow-hidden">
            {children}
        </div>
    );
}