export default function MainView({ children }) {
    return (
        <div className="flex flex-col justify-between max-w-md w-full h-[90vh] bg-[#DCD9D9] shadow-md rounded-lg pb-24">
            {children}
        </div>
    );
}