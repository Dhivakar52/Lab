import { X, Heart, MessageCircle, Eye } from "lucide-react";

interface User {
  UserID?: number;
  UserName?: string;
  Tenant?: string;
  ViewedBy?: string;
}

interface Comment {
  NominationCommentsID: number;
  NominationID: number;
  CommentedBy: string;
  CommentsText: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  activeTab: "likes" | "comments" | "views";
  setActiveTab: (tab: "likes" | "comments" | "views") => void;
  likeList: User[];
  comments: Comment[];
  viewerList: User[];
  selectedPost: any;
  getInitial: (name?: string) => string;
}

const ReactionsModal: React.FC<Props> = ({
  open,
  onClose,
  activeTab,
  setActiveTab,
  likeList,
  comments,
  viewerList,
  selectedPost,
  getInitial
}) => {
  if (!open) return null;

  return (
           <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
              <div className="bg-white w-[520px] rounded-xl shadow-xl overflow-hidden">
                <div className="px-6 pt-4 border-b">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[15px] font-medium text-gray-800">
                      Reactions
                    </h3>
                    <button onClick={onClose}>
                      <X size={18} className="text-gray-500" />
                    </button>
                  </div>
                  <div className="flex gap-8 relative">
                    <button
                      onClick={() => setActiveTab("likes")}
                      className="relative flex items-center gap-1 pb-3 text-sm">
                      <Heart
                        size={16}
                        className={
                          activeTab === "likes"
                            ? "text-red-500 fill-red-500"
                            : "text-gray-500"
                        }/>
                      <span>{likeList.length}</span>

                      {activeTab === "likes" && (
                        <div className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-green-600 rounded-full" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("comments")}
                      className="relative flex items-center gap-1 pb-3 text-sm">
                      <MessageCircle
                        size={16}
                        className={
                          activeTab === "comments"
                            ? "text-blue-600 fill-blue-500"
                            : "text-gray-500"
                        } />
                      <span>
                        {
                          comments.filter(
                            c => c.NominationID === selectedPost?.NominationID
                          ).length
                        }
                      </span>
                      {activeTab === "comments" && (
                        <div className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-green-600 rounded-full" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("views")}
                      className="relative flex items-center gap-1 pb-3 text-sm">
                      <Eye
                        size={16}
                        className={
                          activeTab === "views"
                            ? "text-blue-600"
                            : "text-gray-500"
                        }/>
                      <span>{viewerList.length}</span>
                      {activeTab === "views" && (
                        <div className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-green-600 rounded-full" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                  {activeTab === "likes" &&
                    likeList.map((u: any, i: number) => (
                      <div
                        key={u.UserID ?? i}
                        className="flex items-center gap-4 px-6 h-[64px]
                                  border-b border-gray-100 last:border-b-0">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full themeColor
                                          text-white flex items-center justify-center
                                          text-sm font-semibold">
                            {getInitial(u.UserName)}
                          </div>
                          <div className="absolute -bottom-1 -right-1
                                          w-4 h-4 bg-red-500 rounded-full
                                          flex items-center justify-center shadow-sm">
                            <Heart size={11} fill="white" className="text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {u.UserName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {u.Tenant}
                          </div>
                        </div>
                      </div>
                    ))}
                  {activeTab === "comments" &&
                    comments
                      .filter(
                        c => c.NominationID === selectedPost?.NominationID
                      )
                      .map((c: any) => (
                        <div
                          key={c.NominationCommentsID}
                          className="px-6 py-4 border-b border-gray-100">
                          <div className="flex gap-3 items-center mb-1">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full themeColor
                                text-white flex items-center justify-center text-xs font-semibold">
                                {getInitial(c.CommentedBy)}
                              </div>
                              <div className="absolute -bottom-1 -right-1
                                w-4 h-4 bg-blue-500 rounded-full
                                flex items-center justify-center shadow-sm">
                                <MessageCircle size={11} fill="white" className="text-white" />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                              {c.CommentedBy || "Unknown User"}
                            </span>
                          </div>
                          <p className="ml-11 text-sm text-gray-700">
                            {c.CommentsText}
                          </p>
                        </div>
                  ))}
                  {activeTab === "views" &&
                    viewerList.map((v: any, i: number) => (
                      <div
                        key={v.UserID ?? i}
                        className="flex items-center gap-4 px-6 h-[64px]
                          border-b border-gray-100 last:border-b-0">
                        <div className="relative">
                          <div
                            className="w-9 h-9 rounded-full bg-teal-600
                              text-white flex items-center justify-center
                              text-sm font-semibold">
                            {getInitial(v.UserName || v.ViewedBy)}
                          </div>

                          <div className="absolute -bottom-1 -right-1
                            w-4 h-4 bg-blue-500 rounded-full
                            flex items-center justify-center shadow-sm">
                            <Eye size={11} className="text-white" />
                          </div>
                        </div>

                        <div className="text-sm font-medium text-gray-800">
                          {v.UserName || v.ViewedBy || "Unknown User"}
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
  );
};

export default ReactionsModal;
