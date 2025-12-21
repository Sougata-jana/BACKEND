import { Bookmark, Clock, Tag, Trash2, Edit2 } from 'lucide-react';

const BookmarkList = ({ bookmarks, onJumpTo, onDelete }) => {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No bookmarks yet</p>
        <p className="text-sm">Click the bookmark button while watching to save moments</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark._id}
          className="group p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer"
          onClick={() => onJumpTo(bookmark.timestamp)}
        >
          <div className="flex items-start gap-3">
            {/* Color Indicator */}
            <div
              className="w-1 h-full rounded-full flex-shrink-0"
              style={{ backgroundColor: bookmark.color }}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title and Timestamp */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {bookmark.title}
                </h4>
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-mono flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatTime(bookmark.timestamp)}
                </div>
              </div>

              {/* Note */}
              {bookmark.note && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {bookmark.note}
                </p>
              )}

              {/* Tags */}
              {bookmark.tags && bookmark.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <Tag className="w-3 h-3 text-gray-400" />
                  {bookmark.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(bookmark._id);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookmarkList;
