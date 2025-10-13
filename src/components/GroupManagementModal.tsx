// src/components/GroupManagementModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductGroup } from '@/types';
import {
  loadProductGroups,
  getProductGroup,
  getProviderName,
} from '@/lib/utils';

type GroupManagementModalProps = {
  isOpen: boolean;
  productId: string | null;
  productName: string;
  onClose: () => void;
  onAddToGroup: (groupId: string, productId: string) => void;
  onRemoveFromGroup: (groupId: string, productId: string) => void;
  onMoveToGroup: (fromGroupId: string, toGroupId: string, productId: string) => void;
};

export default function GroupManagementModal({
  isOpen,
  productId,
  productName,
  onClose,
  onAddToGroup,
  onRemoveFromGroup,
  onMoveToGroup,
}: GroupManagementModalProps) {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<ProductGroup | null>(null);

  useEffect(() => {
    if (isOpen && productId) {
      const allGroups = loadProductGroups();
      setGroups(allGroups);
      const group = getProductGroup(productId);
      setCurrentGroup(group);
    }
  }, [isOpen, productId]);

  const handleAddToGroup = (groupId: string) => {
    if (!productId) return;
    onAddToGroup(groupId, productId);
    onClose();
  };

  const handleRemoveFromGroup = () => {
    if (!productId || !currentGroup) return;
    onRemoveFromGroup(currentGroup.id, productId);
    onClose();
  };

  const handleMoveToGroup = (newGroupId: string) => {
    if (!productId || !currentGroup) return;
    onMoveToGroup(currentGroup.id, newGroupId, productId);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gerenciar Grupos</h2>
                <p className="text-sm text-gray-600 mt-1">{productName}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Grupo atual */}
            {currentGroup && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Grupo Atual</h3>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{currentGroup.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {currentGroup.productIds.length} {currentGroup.productIds.length === 1 ? 'produto' : 'produtos'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRemoveFromGroup}
                    className="w-full px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm font-medium"
                  >
                    ↗️ Remover produto deste grupo
                  </button>
                </div>
              </div>
            )}

            {/* Mover para outro grupo ou adicionar a grupo */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {currentGroup ? 'Mover para Outro Grupo' : 'Adicionar a um Grupo'}
              </h3>

              {groups.length === 0 || (currentGroup && groups.length === 1 && groups[0].id === currentGroup.id) ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {currentGroup
                    ? 'Não há outros grupos disponíveis'
                    : 'Nenhum grupo criado ainda. Selecione produtos na página de favoritos e clique em "Unificar produtos".'}
                </div>
              ) : (
                <div className="space-y-2">
                  {groups
                    .filter(g => g.id !== currentGroup?.id)
                    .map((group) => (
                      <div
                        key={group.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{group.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {group.productIds.length} {group.productIds.length === 1 ? 'produto' : 'produtos'} •{' '}
                              {group.productIds.map(id => getProviderName(/^\d+$/.test(id) ? 'kabum' : 'amazon')).join(', ')}
                            </p>
                          </div>
                          <button
                            onClick={() => currentGroup ? handleMoveToGroup(group.id) : handleAddToGroup(group.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                          >
                            {currentGroup ? '→ Mover' : '+ Adicionar'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
