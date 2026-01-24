import { motion, AnimatePresence } from 'framer-motion'
import { Mic, X } from 'lucide-react'

const VoiceSearchModal = ({ isOpen, isListening, transcript, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </motion.button>

            {/* Microphone Animation */}
            <div className="flex flex-col items-center justify-center">
              {/* Animated circles around microphone */}
              <div className="relative w-32 h-32 mb-6">
                {/* Outer pulse circle */}
                {isListening && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-red-500/20"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-red-500/30"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3,
                      }}
                    />
                  </>
                )}

                {/* Main microphone button */}
                <motion.div
                  className={`absolute inset-0 rounded-full flex items-center justify-center ${
                    isListening
                      ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}
                  animate={
                    isListening
                      ? {
                          scale: [1, 1.05, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    animate={
                      isListening
                        ? {
                            y: [0, -3, 0],
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Mic size={48} className="text-white" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Status Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                {isListening ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Listening...
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Speak now to search for videos
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Tap to Speak
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Say something like "cooking videos"
                    </p>
                  </>
                )}

                {/* Show transcript if available */}
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      You said:
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      "{transcript}"
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Sound wave animation */}
              {isListening && (
                <div className="flex items-center justify-center space-x-1 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-red-500 rounded-full"
                      animate={{
                        height: [20, 40, 20],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Hint text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-gray-500 dark:text-gray-500 mt-6 text-center"
              >
                {isListening ? 'Click anywhere to cancel' : 'Make sure your microphone is enabled'}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default VoiceSearchModal
