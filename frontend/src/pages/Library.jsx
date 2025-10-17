import { motion } from 'framer-motion'
import { Library as LibraryIcon, History, Clock, ThumbsUp, Video } from 'lucide-react'

const Library = () => {
  const libraryItems = [
    { icon: History, title: 'History', description: 'Watch it again' },
    { icon: Video, title: 'Your videos', description: 'Manage your content' },
    { icon: Clock, title: 'Watch later', description: 'Videos to watch' },
    { icon: ThumbsUp, title: 'Liked videos', description: 'Videos you liked' },
    { icon: LibraryIcon, title: 'My playlist', description: 'View your playlists' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Library
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {libraryItems.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

export default Library
