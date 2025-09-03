

import { motion, AnimatePresence } from "framer-motion"

import { 
  X,
} from "lucide-react"

// Reusable Modal Component
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

const InfoModal = ({ isOpen, onClose, title, children, icon: Icon }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full blur-3xl opacity-30 -translate-y-8 translate-x-8"></div>
            
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {Icon && (
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="text-gray-600 leading-relaxed">
                {children}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default InfoModal;