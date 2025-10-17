import { motion } from 'framer-motion'
import { History as HistoryIcon } from 'lucide-react'

const History = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <History className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Watch History
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your watch history will appear here
        </p>
      </motion.div>
    </div>
  )
}

export default History
