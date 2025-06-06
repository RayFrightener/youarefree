import { IoMdArrowBack } from "react-icons/io";
import { IoTrashBinOutline } from "react-icons/io5";

export default function UserProfile({ profile, onBack, isOwnProfile = false, onDeletePost }) {
    if (!profile) return <div>Loading...</div>;
    const posts = Array.isArray(profile.posts) ? profile.posts : [];

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center mb-4 mt-4 ml-2">
                <button onClick={onBack} className="m3-3 cursor-pointer" aria-label="Back to feed">
                    <IoMdArrowBack size={24} />
                </button>
                <span className="text-xl font-semibold">{profile.username}</span>
                {profile.karma >= 1 && (
                    <span className="ml-4 px-2 py-1 rounded bg-[#BEBABA] text-[#8C8888] text-sm font-semibold">
                        Karma: {profile.karma}
                    </span>
                )}
            </div>
                {/* Posts */}
                <div className="flex-1 overflow-y-auto space-y-4 px-2 pb-4">
                    {posts.length === 0 ? (
                    <div className="text-center text-[#888] mt-8">  This space is quiet for now — expressions will show up once they’ve received some upliftment.
                    </div>
                    ) : (
                        posts.map((post) => (
                        <div
                        key={post.id}
                        className="bg-white rounded-lg shadow p-4 flex flex-col"
                        >
                        <div className="text-base text-[#333] mb-2">{post.content}</div>
                        <div className="flex items-center justify-between text-xs text-[#9C9191]">
                            <span>
                            {new Date(post.createdAt).toLocaleDateString()}{" "}
                            {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="font-mono">
                            {post.score > 0 ? `+${post.score}` : post.score} upvotes
                            </span>
                            { isOwnProfile && (
                                <button
                                className="ml-2 text-red-500 hover:underline cursor-pointer"
                                onClick={() => onDeletePost && onDeletePost(post.id)}
                                >
                                    <IoTrashBinOutline size={18}/>
                                </button>
                            )}
                        </div>
                        </div>
                    ))
                    )}
                </div>
        </div>
    )
}