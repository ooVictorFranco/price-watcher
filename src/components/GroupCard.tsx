// src/components/GroupCard.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { ProductGroup } from '@/types';
import { motion, useReducedMotion } from 'framer-motion';
import { brl, getProviderName } from '@/lib/utils';

import { ProductPriceInfo } from '@/lib/utils';

type GroupCardProps = {
  group: ProductGroup;
  bestPrice: ProductPriceInfo | null;
  productCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRenameGroup: (newName: string) => void;
  onDeleteGroup: () => void;
  children?: React.ReactNode;
};

export default function GroupCard({
  group,
  bestPrice,
  productCount,
  isExpanded,
  onToggleExpand,
  onRenameGroup,
  onDeleteGroup,
  children,
}: GroupCardProps) {
  const prefersReduced = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(group.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [displayName, setDisplayName] = useState(group.name);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Sincroniza o nome exibido quando o grupo muda
  useEffect(() => {
    setDisplayName(group.name);
  }, [group.name]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleStartEdit = () => {
    setEditingName(true);
    setNewName(group.name);
    setMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!newName.trim() || newName === group.name) {
      setEditingName(false);
      return;
    }

    setIsUpdatingName(true);
    setEditingName(false);

    // Chama a função de renomear
    onRenameGroup(newName.trim());

    // Simula um pequeno delay para mostrar o skeleton
    await new Promise(resolve => setTimeout(resolve, 300));

    // Atualiza o nome exibido
    setDisplayName(newName.trim());
    setIsUpdatingName(false);
  };

  const handleCancelEdit = () => {
    setNewName(group.name);
    setEditingName(false);
  };

  const handleDeleteClick = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setMenuOpen(false);
      return;
    }
    onDeleteGroup();
  };

  return (
    <div className="col-span-full">
      <div className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-600 text-white">
                Produto unificado
              </span>

              {editingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                </div>
              ) : isUpdatingName ? (
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
              ) : (
                <h4 className="text-sm font-bold">{displayName}</h4>
              )}
            </div>

            {bestPrice && bestPrice.priceVista && !editingName && !isUpdatingName && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-600">Melhor preço:</span>
                <span className="text-lg font-bold text-green-600">{brl(bestPrice.priceVista)}</span>
                <span className="text-xs text-gray-500">em {getProviderName(bestPrice.provider)}</span>
              </div>
            )}

            {!editingName && !isUpdatingName && (
              <div className="text-xs text-gray-500 mb-3">
                {productCount} {productCount === 1 ? 'loja' : 'lojas'} disponíveis
              </div>
            )}

            {!editingName && !isUpdatingName && (
              <button
                onClick={onToggleExpand}
                className="text-sm text-blue-600 hover:underline"
              >
                {isExpanded ? '▼ Ocultar detalhes' : '▶ Ver todas as lojas'}
              </button>
            )}
          </div>

          {/* Menu de gerenciamento do grupo */}
          {!editingName && !isUpdatingName && (
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: prefersReduced ? 1 : 1.05 }}
                whileTap={{ scale: prefersReduced ? 1 : 0.95 }}
                className="rounded-md px-2 py-1 text-lg leading-none hover:bg-blue-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Gerenciar grupo"
              >
                ⋯
              </motion.button>

              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-1 w-56 rounded-lg border bg-white shadow-lg overflow-hidden z-50"
                  role="menu"
                >
                  <button
                    onClick={handleStartEdit}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                    role="menuitem"
                  >
                    ✏️ Renomear grupo
                  </button>

                  <div className="border-t border-gray-200 my-1" />

                  <button
                    onClick={handleDeleteClick}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-red-600"
                    role="menuitem"
                  >
                    🗑️ Excluir grupo
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Confirmação de exclusão */}
        {showDeleteConfirm && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
            <p className="text-sm text-red-800 mb-2">
              ⚠️ Tem certeza que deseja excluir este grupo? Os produtos não serão removidos dos favoritos.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteClick}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
              >
                Sim, excluir grupo
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo expandido (produtos) */}
        {isExpanded && children}
      </div>
    </div>
  );
}
