// src/components/admin/ui/ModalCustom.js
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";

export const ModalCustom = ({ title, triggerText, children, open, onOpenChange }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {triggerText && (
        <Dialog.Trigger asChild>
          <button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-md transform hover:scale-105">
            <span className="flex items-center gap-1">
              <Plus size={16} /> {triggerText}
            </span>
          </button>
        </Dialog.Trigger>
      )}

      {/* Portal */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in z-[1000]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 flex items-center justify-center z-[1001] p-4"
        >
          <Dialog.Content className="bg-white p-6 rounded-xl shadow-xl w-[800px] max-w-[85vw] max-h-[90vh] overflow-y-auto relative border-none transform-gpu">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-200 rounded-xl -z-10 blur-lg opacity-25"></div>
            <div className="relative">
              <Dialog.Title className="text-xl font-semibold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="absolute top-1 right-1 text-gray-500 hover:text-gray-800 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100">
                  <X size={20} />
                </button>
              </Dialog.Close>
              <div className="space-y-4 mt-4">{children}</div>
            </div>
          </Dialog.Content>
        </motion.div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};